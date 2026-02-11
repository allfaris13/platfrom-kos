package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"uniqueIndex" json:"username"`
	Password  string         `json:"-"`
	Role      string         `json:"role"` // enum: admin, penyewa, etc.
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
	ResetToken       string         `json:"-"`
	ResetTokenExpiry time.Time      `json:"-"`
}

type Kamar struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	NomorKamar    string         `json:"nomor_kamar"`
	TipeKamar     string         `json:"tipe_kamar"`
	Fasilitas     string         `json:"fasilitas"` // text
	HargaPerBulan float64        `json:"harga_per_bulan"`
	Status        string         `json:"status"` // enum
	Capacity      int            `json:"capacity"`
	Floor         int            `json:"floor"`
	Size          string         `json:"size"`      // e.g. "3x4m" or "12m2"
	Bedrooms      int            `json:"bedrooms"`
	Bathrooms     int            `json:"bathrooms"`
	Description   string         `json:"description"`
	ImageURL      string         `json:"image_url"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Gallery struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `json:"title"`
	Category  string         `json:"category"`
	ImageURL  string         `json:"image_url"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Review struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `json:"user_id"` // User who wrote the review
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	KamarID   uint           `json:"kamar_id"` // Room being reviewed
	Rating    float64        `json:"rating"`   // 1.0 - 5.0
	Comment   string         `json:"comment"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Penyewa struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `json:"user_id"`
	User         User           `gorm:"foreignKey:UserID" json:"user"`
	NamaLengkap  string         `json:"nama_lengkap"`
	Email        string         `json:"email"`
	NIK          string         `json:"nik"`
	NomorHP      string         `json:"nomor_hp"`
	TanggalLahir time.Time      `json:"tanggal_lahir"`
	AlamatAsal   string         `json:"alamat_asal"`
	JenisKelamin string         `json:"jenis_kelamin"` // enum
	FotoProfil   string         `json:"foto_profil"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Pemesanan struct {
	ID              uint             `gorm:"primaryKey" json:"id"`
	PenyewaID       uint             `json:"penyewa_id"`
	Penyewa         Penyewa          `gorm:"foreignKey:PenyewaID" json:"penyewa"`
	KamarID         uint             `json:"kamar_id"`
	Kamar           Kamar            `gorm:"foreignKey:KamarID" json:"kamar"`
	TanggalMulai    time.Time        `json:"tanggal_mulai"`
	DurasiSewa      int              `json:"durasi_sewa"`
	StatusPemesanan string           `json:"status_pemesanan"` // enum
	Pembayaran      []Pembayaran     `gorm:"foreignKey:PemesananID" json:"-"` // Relation for eager loading
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       gorm.DeletedAt   `gorm:"index" json:"-"`
}

type Pembayaran struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	PemesananID      uint           `json:"pemesanan_id"`
	Pemesanan        Pemesanan      `gorm:"foreignKey:PemesananID" json:"pemesanan"`
	JumlahBayar      float64        `json:"jumlah_bayar"`
	TanggalBayar     time.Time      `json:"tanggal_bayar"`
	BuktiTransfer    string         `json:"bukti_transfer"`
	StatusPembayaran string         `json:"status_pembayaran"` // enum: Pending, Confirmed, Failed, Settled
	OrderID          string         `json:"order_id"`
	SnapToken        string         `json:"snap_token"`
	MetodePembayaran string         `json:"metode_pembayaran"` // enum: midtrans, cash
	TipePembayaran   string         `json:"tipe_pembayaran"`   // enum: full, dp (down payment)
	JumlahDP         float64        `json:"jumlah_dp"`         // Jumlah DP jika tipe_pembayaran = dp
	TanggalJatuhTempo time.Time     `json:"tanggal_jatuh_tempo"` // Tanggal pembayaran cicilan berikutnya
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// PaymentReminder untuk tracking pembayaran bulanan
type PaymentReminder struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	PembayaranID    uint           `json:"pembayaran_id"`
	Pembayaran      Pembayaran     `gorm:"foreignKey:PembayaranID" json:"-"`
	JumlahBayar     float64        `json:"jumlah_bayar"`
	TanggalReminder time.Time      `json:"tanggal_reminder"`
	StatusReminder  string         `json:"status_reminder"` // enum: Pending, Paid, Expired
	IsSent          bool           `json:"is_sent"`         // Apakah reminder sudah dikirim
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}


