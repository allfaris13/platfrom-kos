package service

import (
	"errors"
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"log"
	"strings"
)

type KamarService interface {
	GetAll() ([]models.Kamar, error)
	GetByID(id uint) (*models.Kamar, error)
	Create(kamar *models.Kamar) error
	Update(kamar *models.Kamar) error
	Delete(id uint) error
	AddImage(image *models.KamarImage) error
	DeleteImagesByKamarID(kamarID uint) error
	CanDeleteRoom(id uint) (bool, string, error) // Check if room can be deleted (confirmed/active booking)
}

type kamarService struct {
	repo             repository.KamarRepository
	bookingRepo      repository.BookingRepository // Check active/pending bookings
	paymentRepo      repository.PaymentRepository // Cancel pending payments
	penyewaRepo      repository.PenyewaRepository // Load penyewa data for notifications
	waSender         utils.WhatsAppSender          // Send WA notifications
	adminPhoneNumber string                         // Admin phone number for WA alerts (env: ADMIN_PHONE_NUMBER)
}

// NewKamarService creates a new KamarService with all required dependencies.
// adminPhoneNumber should be in international format without '+', e.g. "628123456789".
func NewKamarService(
	repo repository.KamarRepository,
	bookingRepo repository.BookingRepository,
	paymentRepo repository.PaymentRepository,
	penyewaRepo repository.PenyewaRepository,
	waSender utils.WhatsAppSender,
	adminPhoneNumber string,
) KamarService {
	return &kamarService{
		repo:             repo,
		bookingRepo:      bookingRepo,
		paymentRepo:      paymentRepo,
		penyewaRepo:      penyewaRepo,
		waSender:         waSender,
		adminPhoneNumber: adminPhoneNumber,
	}
}

func (s *kamarService) GetAll() ([]models.Kamar, error) {
	return s.repo.FindAll()
}

func (s *kamarService) GetByID(id uint) (*models.Kamar, error) {
	return s.repo.FindByID(id)
}

func (s *kamarService) Create(kamar *models.Kamar) error {
	return s.repo.Create(kamar)
}

func (s *kamarService) Update(kamar *models.Kamar) error {
	// FIX #8: Prevent Admin from setting Room Status to Tersedia if occupied
	if kamar.Status == "Tersedia" {
		activeBooking, err := s.bookingRepo.FindActiveBookingByKamarID(kamar.ID)
		if err == nil && activeBooking != nil {
			// FEATURE #Eviction: Admin forced room to available. We must auto-cancel tying booking
			s.bookingRepo.UpdateStatus(activeBooking.ID, "Cancelled")
		}
	}
	return s.repo.Update(kamar)
}

// Delete menghapus kamar dengan 2 tahap validasi:
//  1. Jika kamar berstatus "Terpesan" (ada booking aktif/confirmed), tolak penghapusan.
//  2. Jika ada booking "Pending" (pembayaran diajukan tapi belum dikonfirmasi admin),
//     otomatis batalkan booking + pembayaran, lalu kirim notifikasi WA ke admin (untuk transfer)
//     atau hanya batalkan (untuk tunai/cash).
func (s *kamarService) Delete(id uint) error {
	// -- Langkah 1: Ambil data kamar --
	kamar, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("kamar tidak ditemukan: %w", err)
	}

	// -- Langkah 2: Blokir jika status kamar "Terpesan" (booking aktif/confirmed) --
	canDelete, reason, err := s.CanDeleteRoom(id)
	if err != nil {
		return err
	}
	if !canDelete {
		return errors.New(reason)
	}

	// -- Langkah 3: Cek apakah ada booking "Pending" (pembayaran diajukan, belum dikonfirmasi) --
	pendingBooking, err := s.bookingRepo.FindPendingBookingByKamarID(id)
	if err != nil {
		return fmt.Errorf("gagal memeriksa booking pending: %w", err)
	}

	if pendingBooking != nil {
		// Ada booking pending — batalkan dan kirim notifikasi
		if err := s.cancelPendingBookingAndNotify(kamar, pendingBooking); err != nil {
			// Catat error notifikasi tapi jangan gagalkan penghapusan
			log.Printf("[WARN] Gagal membatalkan booking pending atau mengirim notifikasi untuk kamar %s: %v", kamar.NomorKamar, err)
		}
	}

	// -- Langkah 4: Hapus kamar --
	return s.repo.Delete(id)
}

// cancelPendingBookingAndNotify membatalkan booking pending dan mengirim notifikasi
// sesuai metode pembayaran (transfer vs tunai).
func (s *kamarService) cancelPendingBookingAndNotify(kamar *models.Kamar, booking *models.Pemesanan) error {
	// 1. Batalkan status booking
	if err := s.bookingRepo.UpdateStatus(booking.ID, "Cancelled"); err != nil {
		return fmt.Errorf("gagal membatalkan booking: %w", err)
	}

	// 2. Batalkan semua pembayaran pending pada booking ini
	if err := s.paymentRepo.CancelPendingPaymentsByBookingID(booking.ID); err != nil {
		log.Printf("[WARN] Gagal membatalkan pembayaran untuk booking %d: %v", booking.ID, err)
	}

	// 3. Tentukan metode pembayaran dari pembayaran terbaru
	paymentMethod := "tunai" // default
	var paidAmount float64 = 0
	var buktiTransfer string
	if len(booking.Pembayaran) > 0 {
		latestPayment := booking.Pembayaran[len(booking.Pembayaran)-1]
		paymentMethod = strings.ToLower(latestPayment.MetodePembayaran)
		paidAmount = latestPayment.JumlahBayar
		buktiTransfer = latestPayment.BuktiTransfer
	}

	// 4. Ambil data penyewa untuk notifikasi
	penyewa := booking.Penyewa
	penyewaName := penyewa.NamaLengkap
	if penyewaName == "" {
		penyewaName = "Penyewa"
	}
	penyewaPhone := penyewa.NomorHP

	// 5. Kirim notifikasi berdasarkan metode pembayaran
	isTransfer := paymentMethod == "transfer" || paymentMethod == "bank_transfer" ||
		paymentMethod == "manual" || strings.Contains(paymentMethod, "transfer")

	if isTransfer {
		// ---- Metode Transfer: Kirim WA ke ADMIN dan USER ----

		// Kirim WA ke admin (notifikasi bahwa kamar dihapus dengan pending booking)
		go s.sendAdminRoomDeletedNotification(kamar, penyewaName, penyewaPhone, paidAmount, buktiTransfer)

		// Kirim WA ke user (penyewa) bahwa pesanan dibatalkan dengan info return uang
		if penyewaPhone != "" {
			go s.sendUserBookingCancelledWithReturn(penyewaPhone, penyewaName, kamar.NomorKamar, paidAmount)
		}

	} else {
		// ---- Metode Tunai/Cash: Hanya kirim notifikasi pembatalan ke USER ----
		if penyewaPhone != "" {
			go s.sendUserBookingCancelledCash(penyewaPhone, penyewaName, kamar.NomorKamar)
		}
	}

	log.Printf("[INFO] Booking pending ID=%d untuk kamar %s telah dibatalkan karena kamar dihapus (metode: %s)",
		booking.ID, kamar.NomorKamar, paymentMethod)

	return nil
}

// sendAdminRoomDeletedNotification mengirim WA ke nomor admin bahwa kamar dengan
// pending booking telah dihapus, serta meminta admin untuk melakukan return dana ke user.
func (s *kamarService) sendAdminRoomDeletedNotification(kamar *models.Kamar, penyewaName, penyewaPhone string, paidAmount float64, buktiTransfer string) {
	if s.adminPhoneNumber == "" {
		log.Println("[WARN] ADMIN_PHONE_NUMBER tidak dikonfigurasi — notifikasi WA ke admin dilewati")
		return
	}

	buktiText := buktiTransfer
	if buktiText == "" {
		buktiText = "(Tidak ada lampiran / Belum diupload)"
	}

	msg := fmt.Sprintf(
		"⚠️ *NOTIFIKASI SISTEM — KAMAR DIHAPUS*\n\n"+
			"Admin secara tidak sengaja telah menghapus data kamar yang memiliki pesanan yang *belum dikonfirmasi*.\n\n"+
			"📋 *Detail:*\n"+
			"• Kamar: *%s*\n"+
			"• Tipe: %s\n"+
			"• Dipesan oleh: *%s*\n"+
			"• No. HP Penyewa: %s\n"+
			"• Jumlah pembayaran yang diajukan: *Rp %.0f*\n"+
			"• Bukti Transfer: %s\n\n"+
			"📌 *Tindakan yang diperlukan:*\n"+
			"Harap segera hubungi penyewa *%s* melalui nomor WA berikut untuk mengembalikan dana atau konfirmasi pembatalan:\n"+
			"wa.me/%s\n\n"+
			"Dana sebesar *Rp %.0f* harus dikembalikan karena pesanan telah otomatis dibatalkan akibat penghapusan kamar.\n\n"+
			"_Pesan ini dikirim otomatis oleh sistem._",
		kamar.NomorKamar,
		kamar.TipeKamar,
		penyewaName,
		func() string {
			if penyewaPhone != "" {
				return penyewaPhone
			}
			return "-"
		}(),
		paidAmount,
		buktiText,
		penyewaName,
		penyewaPhone,
		paidAmount,
	)

	if err := s.waSender.SendWhatsApp(s.adminPhoneNumber, msg); err != nil {
		log.Printf("[ERROR] Gagal mengirim notifikasi WA ke admin (%s): %v", s.adminPhoneNumber, err)
	} else {
		log.Printf("[INFO] Notifikasi WA berhasil dikirim ke admin (%s) untuk kamar %s", s.adminPhoneNumber, kamar.NomorKamar)
	}
}

// sendUserBookingCancelledWithReturn mengirim WA ke penyewa bahwa pesanannya dibatalkan
// dan akan mendapatkan return dana (untuk metode transfer).
func (s *kamarService) sendUserBookingCancelledWithReturn(phone, name, nomorKamar string, returnAmount float64) {
	msg := fmt.Sprintf(
		"Halo *%s*,\n\n"+
			"Kami mohon maaf atas ketidaknyamanan ini. Kamar *%s* yang Anda pesan telah *dihapus oleh admin* secara tidak sengaja.\n\n"+
			"Pesanan Anda telah otomatis *dibatalkan*.\n\n"+
			"💰 *Return Dana:*\n"+
			"Anda akan mendapatkan pengembalian uang sebesar *Rp %.0f* sesuai dengan jumlah yang Anda bayarkan saat pemesanan.\n\n"+
			"👉 *Harap segera hubungi Admin* untuk memproses pengembalian dana atau melakukan pemesanan kamar lainnya.\n\n"+
			"Terima kasih atas pengertian Anda. 🙏",
		name,
		nomorKamar,
		returnAmount,
	)

	if err := s.waSender.SendWhatsApp(phone, msg); err != nil {
		log.Printf("[ERROR] Gagal mengirim notifikasi WA return dana ke penyewa (%s): %v", phone, err)
	}
}

// sendUserBookingCancelledCash mengirim WA ke penyewa bahwa pesanannya dibatalkan
// karena kamar dihapus (untuk metode tunai — tanpa return dana otomatis).
func (s *kamarService) sendUserBookingCancelledCash(phone, name, nomorKamar string) {
	msg := fmt.Sprintf(
		"Halo *%s*,\n\n"+
			"Mohon maaf atas ketidaknyamanan ini. Kamar *%s* yang Anda pesan telah *dihapus oleh admin* secara tidak sengaja.\n\n"+
			"Pesanan Anda telah otomatis *dibatalkan*.\n\n"+
			"👉 *Harap segera hubungi Admin* untuk informasi lebih lanjut atau untuk melakukan pemesanan ulang kamar yang tersedia.\n\n"+
			"Terima kasih. 🙏",
		name,
		nomorKamar,
	)

	if err := s.waSender.SendWhatsApp(phone, msg); err != nil {
		log.Printf("[ERROR] Gagal mengirim notifikasi WA ke penyewa (%s): %v", phone, err)
	}
}

// CanDeleteRoom memeriksa apakah kamar bisa dihapus.
// Kamar TIDAK bisa dihapus jika ada booking aktif/confirmed (status: Aktif, Confirmed, Partially Paid).
// Kamar BISA dihapus jika hanya ada booking Pending (akan di-cancel otomatis).
func (s *kamarService) CanDeleteRoom(id uint) (bool, string, error) {
	// Cek booking aktif (Confirmed/Aktif/Partially Paid)
	activeBooking, err := s.bookingRepo.FindActiveBookingByKamarID(id)
	if err != nil {
		return false, "", err
	}

	if activeBooking != nil {
		return false, "Kamar tidak dapat dihapus karena masih ada pemesanan aktif yang sudah dikonfirmasi. Silakan ubah status kamar atau hubungi penyewa", nil
	}

	return true, "", nil
}

func (s *kamarService) AddImage(image *models.KamarImage) error {
	return s.repo.AddImage(image)
}

func (s *kamarService) DeleteImagesByKamarID(kamarID uint) error {
	return s.repo.DeleteImagesByKamarID(kamarID)
}
