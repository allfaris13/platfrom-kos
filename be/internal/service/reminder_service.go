package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"time"

	"gorm.io/gorm"
)

type ReminderService interface {
	CreateMonthlyReminders() error
	SendPendingReminders() ([]models.PaymentReminder, error)
	MarkReminderAsSent(reminderID uint) error
	MarkPaymentAsPaid(reminderID uint) error
	GetPendingReminders() ([]models.PaymentReminder, error)
}

type reminderService struct {
	paymentRepo repository.PaymentRepository
	db          *gorm.DB
	emailSender utils.EmailSender
	waSender    utils.WhatsAppSender
}

func NewReminderService(paymentRepo repository.PaymentRepository, db *gorm.DB, emailSender utils.EmailSender, waSender utils.WhatsAppSender) ReminderService {
	return &reminderService{paymentRepo, db, emailSender, waSender}
}

// CreateMonthlyReminders membuat reminder untuk tagihan sewa bulanan (extend) otomatis
func (s *reminderService) CreateMonthlyReminders() error {
	// Ambil semua pemesanan yang berstatus Confirmed beserta Kamar dan Pembayaran-nya
	var bookings []models.Pemesanan
	if err := s.db.Preload("Kamar").Preload("Pembayaran").Where("status_pemesanan = ?", "Confirmed").Find(&bookings).Error; err != nil {
		return err
	}

	now := time.Now()
	for _, b := range bookings {
		// Cek apakah ada tagihan yang masih menunggu (Pending atau Rejected).
		// - Pending  : user belum bayar, jangan buat tagihan baru.
		// - Rejected : admin menolak bukti, user perlu upload ulang ke tagihan YANG SAMA,
		//              jangan buat tagihan baru (nanti duplikat).
		hasActionablePayment := false
		var confirmedMonths int

		for _, p := range b.Pembayaran {
			switch p.StatusPembayaran {
			case "Pending", "Rejected":
				hasActionablePayment = true
			case "Confirmed":
				confirmedMonths++
			}
		}

		// Kalau ada tagihan Pending/Rejected, jangan buat tagihan baru
		if hasActionablePayment {
			continue
		}

		// Pastikan kamar memiliki harga yang valid untuk mencegah pembagian dengan 0
		if b.Kamar.HargaPerBulan <= 0 {
			continue
		}

		// Hitung Paid Until Date berdasarkan jumlah bulan yang sudah Confirmed.
		// Ini lebih akurat daripada membagi total uang dengan harga per bulan,
		// karena pembayaran DP (30%) tidak akan menghasilkan angka bulan yang bulat.
		paidUntil := b.TanggalMulai.AddDate(0, confirmedMonths, 0)

		// Buat billing baru jika batas waktu (paidUntil) sudah H-7 dari hari ini atau sudah lewat
		billingTriggerDate := paidUntil.AddDate(0, 0, -7)

		if now.After(billingTriggerDate) || now.Equal(billingTriggerDate) {
			// Buat record Pembayaran baru untuk bulan berikutnya (1 bulan extend)
			payment := models.Pembayaran{
				PemesananID:       b.ID,
				JumlahBayar:       b.Kamar.HargaPerBulan,
				TanggalBayar:      now,
				StatusPembayaran:  "Pending",
				MetodePembayaran:  "manual",
				TipePembayaran:    "extend",
				JumlahDP:          0,
				TanggalJatuhTempo: paidUntil,
			}

			if err := s.db.Create(&payment).Error; err != nil {
				fmt.Printf("Warning: Failed to create auto-payment for booking %d: %v\n", b.ID, err)
				continue
			}

			// Tentukan tanggal reminder (H-3 sebelum masa habis, atau langsung hari ini jika sudah lewat)
			reminderDate := paidUntil.AddDate(0, 0, -3)
			if now.After(reminderDate) {
				reminderDate = now
			}

			reminder := models.PaymentReminder{
				PembayaranID:    payment.ID,
				JumlahBayar:     payment.JumlahBayar,
				TanggalReminder: reminderDate,
				StatusReminder:  "Pending",
				IsSent:          false,
			}

			if err := s.db.Create(&reminder).Error; err != nil {
				fmt.Printf("Warning: Failed to create auto-reminder for payment %d: %v\n", payment.ID, err)
			} else {
				fmt.Printf("Created auto-bill and reminder for booking %d, paid until %s\n", b.ID, paidUntil.Format("2006-01-02"))
			}
		}
	}

	return nil
}

// SendPendingReminders mengirim reminders yang sudah jatuh tempo
func (s *reminderService) SendPendingReminders() ([]models.PaymentReminder, error) {
	var reminders []models.PaymentReminder

	// Ambil reminder yang Pending, belum terkirim, dan tanggal reminder <= hari ini
	today := time.Now()
	if err := s.db.Where("status_reminder = ? AND is_sent = ? AND tanggal_reminder <= ?", "Pending", false, today).Find(&reminders).Error; err != nil {
		return nil, err
	}

	for i := range reminders {
		// Use Preloaded data to get tenant details
		var reminder models.PaymentReminder

		if err := s.db.Preload("Pembayaran.Pemesanan.Penyewa").Preload("Pembayaran.Pemesanan.Kamar").First(&reminder, reminders[i].ID).Error; err == nil {

			tenant := reminder.Pembayaran.Pemesanan.Penyewa
			kamar := reminder.Pembayaran.Pemesanan.Kamar

			// 1. Send Email (Dinonaktifkan sesuai permintaan)
			// if tenant.Email != "" {
			// 	frontendURL := os.Getenv("FRONTEND_URL")
			// 	if frontendURL == "" {
			// 		frontendURL = "http://localhost:3000"
			// 	}
			// 	paymentLink := fmt.Sprintf("%s/dashboard/payments/%d", frontendURL, reminder.PembayaranID)
			// 	go func(email, name string, amount float64, due time.Time, link string) {
			// 		s.emailSender.SendPaymentReminderEmail(email, name, amount, due, link)
			// 	}(tenant.Email, tenant.NamaLengkap, reminder.JumlahBayar, reminder.Pembayaran.TanggalJatuhTempo, paymentLink)
			// }

			// 2. Send WhatsApp
			// Nomor hardcode sesuai permintaan
			phone := "081332314854"
			dueDateFormated := reminder.Pembayaran.TanggalJatuhTempo.Format("02 Jan 2006")
			msg := fmt.Sprintf("Halo %s 👋\n\nIni adalah pesan dari sistem Kost.\nMengingatkan bahwa tagihan sewa Kamar %s Bapak/Ibu sebesar *Rp %.0f* akan jatuh tempo pada *%s*.\n\nMohon segera melunasi pembayaran bulan ini melalui website Kost agar sewa kamar tetap aktif.\nTerima kasih!",
				tenant.NamaLengkap, kamar.NomorKamar, reminder.JumlahBayar, dueDateFormated)

			go func(phone, message string) {
				s.waSender.SendWhatsApp(phone, message)
			}(phone, msg)

			fmt.Printf("Sent notifications for Reminder ID %d\n", reminder.ID)
		}

		// Update status
		reminders[i].IsSent = true
		s.db.Save(&reminders[i])
	}

	return reminders, nil
}

// MarkReminderAsSent tandai reminder sudah dikirim
func (s *reminderService) MarkReminderAsSent(reminderID uint) error {
	return s.db.Model(&models.PaymentReminder{}).Where("id = ?", reminderID).Update("is_sent", true).Error
}

// MarkPaymentAsPaid tandai pembayaran reminder sebagai lunas
func (s *reminderService) MarkPaymentAsPaid(reminderID uint) error {
	return s.db.Model(&models.PaymentReminder{}).Where("id = ?", reminderID).Update("status_reminder", "Paid").Error
}

// GetPendingReminders ambil semua reminder yang pending
func (s *reminderService) GetPendingReminders() ([]models.PaymentReminder, error) {
	var reminders []models.PaymentReminder
	err := s.db.Where("status_reminder = ?", "Pending").Preload("Pembayaran.Pemesanan.Penyewa").Find(&reminders).Error
	return reminders, err
}
