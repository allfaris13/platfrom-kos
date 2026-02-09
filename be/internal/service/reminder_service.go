package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
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
	// Bisa ditambahkan service untuk email/notification di masa depan
}

func NewReminderService(paymentRepo repository.PaymentRepository, db *gorm.DB) ReminderService {
	return &reminderService{paymentRepo, db}
}

// CreateMonthlyReminders membuat reminder untuk semua pembayaran DP yang jatuh tempo
func (s *reminderService) CreateMonthlyReminders() error {
	// Ambil semua pembayaran dengan tipe "dp" yang belum lunas (belum Settled)
	var payments []models.Pembayaran
	// Asumsi logic: pembayaran DP yang sudah Confirmed tapi belum lunas keseluruhannya (masih nyicil/bulanan)
	// Kita cari pembayaran yang TipePembayaran = 'dp' dan StatusPembayaran = 'Confirmed'
	// Note: Logic bisnis ini mungkin perlu disesuaikan dengan flow 'Settled' vs 'Confirmed'
	if err := s.db.Where("tipe_pembayaran = ? AND status_pembayaran = ?", "dp", "Confirmed").Find(&payments).Error; err != nil {
		return err
	}

	for _, p := range payments {
		// Cek apakah sudah ada reminder untuk bulan ini/periode ini
		// Logic sederhana: Reminder dibuat jika belum ada reminder yang 'Pending' atau 'Sent' untuk pembayaran ini yang tanggalnya > hari ini
		// Atau lebih baik: Cek apakah TanggalJatuhTempo sudah dekat

		// Misalnya: Jatuh tempo setiap tanggal X. Kita buat reminder H-3.
		// Disini kita simulasikan pembuatan reminder jika belum ada reminder pending.
		
		var count int64
		s.db.Model(&models.PaymentReminder{}).
			Where("pembayaran_id = ? AND status_reminder IN ?", p.ID, []string{"Pending", "Sent"}).
			Count(&count)

		if count == 0 {
			// Buat reminder baru
			// Hitung sisa tagihan = Total - DP (asumsi sederhana, real case mungkin perlu tracking cicilan)
			// Disini kita ambil dari JumlahBayar original atau logic lain. 
			// Untuk simplifikasi: Kita buat reminder sebesar nominal bulanan (misal 1 juta)
			// Atau sisa tagihan. Kita pakai logic placeholder.
			
			// Ambil nominal bulanan dari Kamar via Booking
			var booking models.Pemesanan
			if err := s.db.Preload("Kamar").First(&booking, p.PemesananID).Error; err == nil {
				monthlyFee := booking.Kamar.HargaPerBulan
				
				reminder := models.PaymentReminder{
					PembayaranID:    p.ID,
					JumlahBayar:     monthlyFee,
					TanggalReminder: time.Now().AddDate(0, 0, 3), // H-3 dari jatuh tempo (logic disederhanakan)
					StatusReminder:  "Pending",
					IsSent:          false,
				}
				s.db.Create(&reminder)
				fmt.Printf("Created reminder for payment %d\n", p.ID)
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
		// Simulasi kirim notifikasi
		fmt.Printf("Display notification for Reminder ID %d: Please pay Rp %.2f\n", reminders[i].ID, reminders[i].JumlahBayar)
		
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
