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
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
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
	User         User           `gorm:"foreignKey:UserID" json:"-"`
	NamaLengkap  string         `json:"nama_lengkap"`
	NIK          string         `json:"nik"`
	NomorHP      string         `json:"nomor_hp"`
	AlamatAsal   string         `json:"alamat_asal"`
	JenisKelamin string         `json:"jenis_kelamin"` // enum
	FotoProfil   string         `json:"foto_profil"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Pemesanan struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	PenyewaID       uint           `json:"penyewa_id"`
	Penyewa         Penyewa        `gorm:"foreignKey:PenyewaID" json:"-"`
	KamarID         uint           `json:"kamar_id"`
	Kamar           Kamar          `gorm:"foreignKey:KamarID" json:"-"`
	TanggalMulai    time.Time      `json:"tanggal_mulai"`
	DurasiSewa      int            `json:"durasi_sewa"`
	StatusPemesanan string         `json:"status_pemesanan"` // enum
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

type Pembayaran struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	PemesananID      uint           `json:"pemesanan_id"`
	Pemesanan        Pemesanan      `gorm:"foreignKey:PemesananID" json:"-"`
	JumlahBayar      float64        `json:"jumlah_bayar"`
	TanggalBayar     time.Time      `json:"tanggal_bayar"`
	BuktiTransfer    string         `json:"bukti_transfer"`
	StatusPembayaran string         `json:"status_pembayaran"` // enum: Pending, Confirmed, Failed, Settled
	OrderID          string         `json:"order_id"`
	SnapToken        string         `json:"snap_token"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type Laporan struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Periode             string         `json:"periode"`
	TotalPemasukan      float64        `json:"total_pemasukan"`
	JumlahPenghuniAktif int            `json:"jumlah_penghuni_aktif"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}
