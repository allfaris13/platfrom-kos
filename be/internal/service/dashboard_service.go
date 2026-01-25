package service

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type DashboardStats struct {
	TotalRevenue    float64 `json:"total_revenue"`
	ActiveTenants   int64   `json:"active_tenants"`
	AvailableRooms  int64   `json:"available_rooms"`
	OccupiedRooms   int64   `json:"occupied_rooms"`
	PendingPayments int64   `json:"pending_payments"`
}

type DashboardService interface {
	GetStats() (*DashboardStats, error)
}

type dashboardService struct {
	db *gorm.DB
}

func NewDashboardService(db *gorm.DB) DashboardService {
	return &dashboardService{db}
}

func (s *dashboardService) GetStats() (*DashboardStats, error) {
	var stats DashboardStats

	// Total Revenue (Sum of confirmed payments)
	s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = ?", "Confirmed").
		Select("COALESCE(SUM(jumlah_bayar), 0)").
		Scan(&stats.TotalRevenue)

	// Active Tenants (Based on Penyewa count, assume all in Penyewa are active/history)
	// Or based on actual status logic if added. Using count for now.
	s.db.Model(&models.Penyewa{}).Count(&stats.ActiveTenants)

	// Room Stats
	s.db.Model(&models.Kamar{}).Where("status = ?", "Tersedia").Count(&stats.AvailableRooms)
	s.db.Model(&models.Kamar{}).Where("status = ?", "Penuh").Count(&stats.OccupiedRooms)

	// Pending Payments
	s.db.Model(&models.Pembayaran{}).Where("status_pembayaran = ?", "Pending").Count(&stats.PendingPayments)

	return &stats, nil
}
