package service

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type MonthlyData struct {
	Month   string  `json:"month"`
	Revenue float64 `json:"revenue"`
}

type TypeRevenue struct {
	Type     string  `json:"type"`
	Revenue  float64 `json:"revenue"`
	Count    int     `json:"count"`
	Occupied int     `json:"occupied"`
}

type Demographic struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
	Color string `json:"color"`
}

type DashboardStats struct {
	TotalRevenue    float64       `json:"total_revenue"`
	ActiveTenants   int64         `json:"active_tenants"`
	AvailableRooms  int64         `json:"available_rooms"`
	OccupiedRooms   int64         `json:"occupied_rooms"`
	PendingPayments int64         `json:"pending_payments"`
	MonthlyTrend    []MonthlyData `json:"monthly_trend"`
	TypeBreakdown   []TypeRevenue `json:"type_breakdown"`
	Demographics    []Demographic `json:"demographics"`
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

	// Monthly Trend (Last 6 months)
	s.db.Raw(`
        SELECT strftime('%b', tanggal_bayar) as month, SUM(jumlah_bayar) as revenue 
        FROM pembayarans 
        WHERE status_pembayaran = 'Confirmed' 
        GROUP BY month 
        ORDER BY tanggal_bayar DESC 
        LIMIT 6
    `).Scan(&stats.MonthlyTrend)

	// Type Breakdown
	var types []struct {
		TipeKamar string
		Count     int
	}
	s.db.Model(&models.Kamar{}).Select("tipe_kamar, count(*) as count").Group("tipe_kamar").Scan(&types)

	for _, t := range types {
		var occ int64
		s.db.Model(&models.Kamar{}).Where("tipe_kamar = ? AND status = ?", t.TipeKamar, "Penuh").Count(&occ)

		var rev float64
		// Revenue from this type
		s.db.Raw(`
            SELECT COALESCE(SUM(p.jumlah_bayar), 0)
            FROM pembayarans p
            JOIN pemesanans pm ON p.pemesanan_id = pm.id
            JOIN kamars k ON pm.kamar_id = k.id
            WHERE k.tipe_kamar = ? AND p.status_pembayaran = 'Confirmed'
        `, t.TipeKamar).Scan(&rev)

		stats.TypeBreakdown = append(stats.TypeBreakdown, TypeRevenue{
			Type:     t.TipeKamar,
			Revenue:  rev,
			Count:    t.Count,
			Occupied: int(occ),
		})
	}

	// Demographics (Mocked because age field missing, but flexible for future)
	stats.Demographics = []Demographic{
		{Name: "18-25", Value: 33, Color: "#f59e0b"},
		{Name: "26-35", Value: 45, Color: "#3b82f6"},
		{Name: "36-45", Value: 15, Color: "#10b981"},
		{Name: "45+", Value: 7, Color: "#8b5cf6"},
	}

	return &stats, nil
}
