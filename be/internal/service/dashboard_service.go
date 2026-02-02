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
	TotalRevenue     float64       `json:"total_revenue"`
	ActiveTenants    int64         `json:"active_tenants"`
	AvailableRooms   int64         `json:"available_rooms"`
	OccupiedRooms    int64         `json:"occupied_rooms"`
	PendingPayments  int64         `json:"pending_payments"`
	PendingRevenue   float64       `json:"pending_revenue"`
	RejectedPayments int64         `json:"rejected_payments"`
	PotentialRevenue float64       `json:"potential_revenue"`
	MonthlyTrend     []MonthlyData `json:"monthly_trend"`
	TypeBreakdown    []TypeRevenue `json:"type_breakdown"`
	Demographics     []Demographic `json:"demographics"`
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

	// 1. Total Revenue (Confirmed)
	s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = ?", "Confirmed").
		Select("COALESCE(SUM(jumlah_bayar), 0)").
		Scan(&stats.TotalRevenue)

	// 2. Pending Revenue & Count
	s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = ?", "Pending").
		Select("COALESCE(SUM(jumlah_bayar), 0)").
		Scan(&stats.PendingRevenue)

	s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = ?", "Pending").
		Count(&stats.PendingPayments)

	// 3. Rejected Payments Count
	s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = ?", "Rejected").
		Count(&stats.RejectedPayments)

	// 4. Room Stats
	s.db.Model(&models.Kamar{}).Where("status = ?", "Tersedia").Count(&stats.AvailableRooms)
	s.db.Model(&models.Kamar{}).Where("status = ?", "Penuh").Count(&stats.OccupiedRooms)

	// 5. Active Tenants
	// Assuming 'Penyewa' table holds active tenants.
	s.db.Model(&models.Penyewa{}).Count(&stats.ActiveTenants)

	// 6. Potential Revenue (Sum of 'harga_per_bulan' of ALL rooms)
	// This represents the max possible revenue if 100% occupancy.
	s.db.Model(&models.Kamar{}).
		Select("COALESCE(SUM(harga_per_bulan), 0)").
		Scan(&stats.PotentialRevenue)

	// 7. Monthly Trend (Last 6 months)
	// Using a more generic approach compatible with both SQLite and Postgres for now,
	// or conditional logic. Since user is migrating to Postgres, we try standard SQL or GORM scope.
	// However, 'strftime' is SQLite specific, 'TO_CHAR' is Postgres.
	// Let's use a raw query that handles basic date extraction if possible,
	// or detect dialect. For simplicity in this refactor, we can fetch recent payments and aggregate in Go
	// to avoid SQL dialect hell, or use specific SQL for the target (Postgres).
	// Given the migrate to Postgres instruction, we'll favor Postgres syntax OR use a robust Cross-DB way.

	// Attempting a raw query that fits Postgres (requested target).
	// SQLite use 'strftime', Postgres use 'to_char'.
	// Use GORM's Dialector name check if needed, but for now assuming Postgres as primary target per instructions.
	// If the current running DB is still SQLite (make run), this might fail.
	// Let's check if we can write a query compatible or fallback.
	// Safest "Execution" mode implies solving the problem.
	// We will Aggregate in Go for safety across migrations unless dataset is huge.
	// It ensures 100% compatibility.

	rows, err := s.db.Model(&models.Pembayaran{}).
		Where("status_pembayaran = 'Confirmed'").
		Order("tanggal_bayar DESC").
		Limit(100). // Limit to recent 100 payments for trend to avoid fetching all
		Rows()
	if err == nil {
		defer rows.Close()
		monthMap := make(map[string]float64)
		var orderedMonths []string

		for rows.Next() {
			var p models.Pembayaran
			s.db.ScanRows(rows, &p)
			month := p.TanggalBayar.Format("Jan") // Go format "Jan" = "Jan"
			if _, exists := monthMap[month]; !exists {
				orderedMonths = append(orderedMonths, month)
			}
			monthMap[month] += float64(p.JumlahBayar)
		}
		// Since we ordered by date DESC, the months are in reverse order (newest first).
		// We want standard chart order (oldest to newest)? Or just match UI.
		// UI expects array. Let's return the simplified map converted to slice.
		// Actually UI often shows Jan, Feb, Mar...
		// Let's just return the aggregated map in a clean way.
		// NOTE: 'orderedMonths' might have duplicates if we iterate rows.
		// Better: Iterate and aggregate.
		// Re-make orderedMonths unique would be needed.

		// Simplified approach: Just 6 months hardcoded names? No, must be dynamic.
		// Let's stick to the SQL approach but make it Postgres friendly as requested.
		// User said: "Migrating... to PostgreSQL".
		// We will use TO_CHAR. If they run SQLite locally, it breaks.
		// Let's stick to the Go aggregation for maximum safety if uncertain of runtime environment.
	}

	// Go Aggregation Implementation for Trend
	type trendResult struct {
		Month   string
		Revenue float64
	}
	// Fetch confirmed payments from last 6 months
	// We can use time.Now().AddDate(0, -6, 0) logic
	// But let's keep it simple: Select month, sum matches.
	// Logic:
	// If Postgres: TO_CHAR(tanggal_bayar, 'Mon')
	// If SQLite: strftime('%b', tanggal_bayar)
	dialect := s.db.Dialector.Name()
	query := ""
	if dialect == "postgres" {
		query = `SELECT TO_CHAR(tanggal_bayar, 'Mon') as month, SUM(jumlah_bayar) as revenue 
                 FROM pembayarans WHERE status_pembayaran = 'Confirmed' 
                 GROUP BY TO_CHAR(tanggal_bayar, 'Mon'), DATE_TRUNC('month', tanggal_bayar)
                 ORDER BY DATE_TRUNC('month', tanggal_bayar) DESC LIMIT 6`
	} else {
		// Fallback to SQLite
		query = `SELECT strftime('%m', tanggal_bayar) as month_num, strftime('%Y', tanggal_bayar) as year_num, SUM(jumlah_bayar) as revenue 
                 FROM pembayarans WHERE status_pembayaran = 'Confirmed' 
                 GROUP BY month_num, year_num
                 ORDER BY year_num DESC, month_num DESC LIMIT 6`
	}

	// For SQLite we need to map numbers to names manually if using %m.
	// Or use %b. %b is safer if system locale supports it. Start with %b.
	if dialect == "sqlite" {
		query = `SELECT strftime('%Y-%m', tanggal_bayar) as ym, SUM(jumlah_bayar) as revenue
                 FROM pembayarans WHERE status_pembayaran = 'Confirmed'
                 GROUP BY ym
                 ORDER BY ym DESC LIMIT 6`
	}

	rowsTrend, err := s.db.Raw(query).Rows()
	if err == nil {
		defer rowsTrend.Close()
		for rowsTrend.Next() {
			var monthStr string
			var rev float64
			if dialect == "postgres" {
				// Postgres returns Month name directly with TO_CHAR
				s.db.ScanRows(rowsTrend, &struct {
					Month   string
					Revenue float64
				}{})
				// Scan manually
				rowsTrend.Scan(&monthStr, &rev)
			} else {
				// SQLite returns YYYY-MM
				var ym string
				rowsTrend.Scan(&ym, &rev)
				monthStr = ym // sending YYYY-MM is fine, or parse it to Name
			}
			stats.MonthlyTrend = append(stats.MonthlyTrend, MonthlyData{Month: monthStr, Revenue: rev})
		}
		// Reverse to show Oldest -> Newest
		for i, j := 0, len(stats.MonthlyTrend)-1; i < j; i, j = i+1, j-1 {
			stats.MonthlyTrend[i], stats.MonthlyTrend[j] = stats.MonthlyTrend[j], stats.MonthlyTrend[i]
		}
	}

	// 8. Type Breakdown
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

	// 9. Demographics (Mocked)
	stats.Demographics = []Demographic{
		{Name: "18-25", Value: 33, Color: "#f59e0b"},
		{Name: "26-35", Value: 45, Color: "#3b82f6"},
		{Name: "36-45", Value: 15, Color: "#10b981"},
		{Name: "45+", Value: 7, Color: "#8b5cf6"},
	}

	return &stats, nil
}
