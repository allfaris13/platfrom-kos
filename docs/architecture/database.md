# Database

Dokumentasi lengkap schema database, model GORM, dan strategi migration.

## Database Engine

- **PostgreSQL 15** (Alpine) — Dijalankan via Docker atau instalasi lokal.
- **GORM v1.31.1** — ORM untuk Go dengan auto-migration, relationship, dan soft delete.
- **Timezone** — `Asia/Jakarta` (WIB)

## Koneksi Database

Konfigurasi koneksi dan connection pool dari `database.go`:

```go
// Dari be/internal/database/database.go

func InitDB(cfg *config.Config) {
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
        cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
    )
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

    // Connection Pool Optimization
    sqlDB, _ := DB.DB()
    sqlDB.SetMaxIdleConns(10)       // Reuse idle connections
    sqlDB.SetMaxOpenConns(100)      // Max concurrent connections
    sqlDB.SetConnMaxLifetime(time.Hour) // Prevent stale connections

    // Auto Migration
    DB.AutoMigrate(
        &models.User{},
        &models.Kamar{},
        &models.Penyewa{},
        &models.Pemesanan{},
        &models.Pembayaran{},
        &models.Gallery{},
        &models.Review{},
        &models.PaymentReminder{},
    )
}
```

Sumber: [`be/internal/database/database.go`](file:///home/arkan/coding/UPK_semester_2/be/internal/database/database.go)

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Penyewa : "has profile"
    User ||--o{ Review : "writes"
    Penyewa ||--o{ Pemesanan : "books"
    Kamar ||--o{ Pemesanan : "is booked"
    Kamar ||--o{ Review : "has reviews"
    Kamar ||--o{ KamarImage : "has many"
    Pemesanan ||--o{ Pembayaran : "has payments"
    Pembayaran ||--o{ PaymentReminder : "has reminders"

    User {
        uint ID PK
        string Username UK
        string Password
        string Role
        string ResetToken
        time ResetTokenExpiry
    }

    Penyewa {
        uint ID PK
        uint UserID FK
        string NamaLengkap
        string Email
        string NIK
        string NomorHP
        time TanggalLahir
        string AlamatAsal
        string JenisKelamin
        string FotoProfil
        string Role
    }

    Kamar {
        uint ID PK
        string NomorKamar
        string TipeKamar
        string Fasilitas
        float64 HargaPerBulan
        string Status
        int Capacity
        int Floor
        string Size
        int Bedrooms
        int Bathrooms
        string Description
        string ImageURL
    }

    KamarImage {
        uint ID PK
        uint KamarID FK
        string ImageURL
    }

    Pemesanan {
        uint ID PK
        uint PenyewaID FK
        uint KamarID FK
        time TanggalMulai
        int DurasiSewa
        string StatusPemesanan
    }

    Pembayaran {
        uint ID PK
        uint PemesananID FK
        float64 JumlahBayar
        time TanggalBayar
        string BuktiTransfer
        string StatusPembayaran
        string OrderID
        string MetodePembayaran
        string TipePembayaran
        float64 JumlahDP
        time TanggalJatuhTempo
    }

    Gallery {
        uint ID PK
        string Title
        string Category
        string ImageURL
    }

    Review {
        uint ID PK
        uint UserID FK
        uint KamarID FK
        float64 Rating
        string Comment
    }

    PaymentReminder {
        uint ID PK
        uint PembayaranID FK
        float64 JumlahBayar
        time TanggalReminder
        string StatusReminder
        bool IsSent
    }
```

## Model Definitions

Semua model didefinisikan di satu file [`be/internal/models/models.go`](file:///home/arkan/coding/UPK_semester_2/be/internal/models/models.go):

### User

```go
type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Username  string         `gorm:"uniqueIndex" json:"username"`
    Password  string         `json:"-"`                  // Hidden dari JSON
    Role      string         `json:"role"`               // admin, penyewa
    CreatedAt        time.Time      `json:"created_at"`
    UpdatedAt        time.Time      `json:"updated_at"`
    DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`  // Soft delete
    ResetToken       string         `json:"-"`
    ResetTokenExpiry time.Time      `json:"-"`
}
```

### Kamar (Room)

```go
type Kamar struct {
    ID            uint           `gorm:"primaryKey" json:"id"`
    NomorKamar    string         `json:"nomor_kamar"`
    TipeKamar     string         `json:"tipe_kamar"`
    Fasilitas     string         `json:"fasilitas"`
    HargaPerBulan float64        `json:"harga_per_bulan"`
    Status        string         `json:"status"`
    Capacity      int            `json:"capacity"`
    Floor         int            `json:"floor"`
    Size          string         `json:"size"`
    Bedrooms      int            `json:"bedrooms"`
    Bathrooms     int            `json:"bathrooms"`
    Description   string         `json:"description"`
    ImageURL      string         `json:"image_url"`
    Images        []KamarImage   `gorm:"foreignKey:KamarID" json:"Images,omitempty"`
}

type KamarImage struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    KamarID   uint           `json:"kamar_id"`
    ImageURL  string         `json:"image_url"`
}
```

### Penyewa (Tenant Profile)

```go
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
    JenisKelamin string         `json:"jenis_kelamin"`
    FotoProfil   string         `json:"foto_profil"`
    Role         string         `gorm:"default:guest" json:"role"` // guest, tenant, former_tenant
    // ... timestamps & soft delete
}
```

### Pemesanan (Booking)

```go
type Pemesanan struct {
    ID              uint             `gorm:"primaryKey" json:"id"`
    PenyewaID       uint             `json:"penyewa_id"`
    Penyewa         Penyewa          `gorm:"foreignKey:PenyewaID" json:"penyewa"`
    KamarID         uint             `json:"kamar_id"`
    Kamar           Kamar            `gorm:"foreignKey:KamarID" json:"kamar"`
    TanggalMulai    time.Time        `json:"tanggal_mulai"`
    DurasiSewa      int              `json:"durasi_sewa"`        // dalam bulan
    StatusPemesanan string           `json:"status_pemesanan"`   // Pending, Confirmed, Cancelled, Active, Completed
    Pembayaran      []Pembayaran     `gorm:"foreignKey:PemesananID" json:"-"`
    // ... timestamps & soft delete
}
```

### Pembayaran (Payment)

```go
type Pembayaran struct {
    ID               uint           `gorm:"primaryKey" json:"id"`
    PemesananID      uint           `json:"pemesanan_id"`
    Pemesanan        Pemesanan      `gorm:"foreignKey:PemesananID" json:"pemesanan"`
    JumlahBayar      float64        `json:"jumlah_bayar"`
    TanggalBayar     time.Time      `json:"tanggal_bayar"`
    BuktiTransfer    string         `json:"bukti_transfer"`
    StatusPembayaran string         `json:"status_pembayaran"`
    OrderID          string         `json:"order_id"`
    MetodePembayaran string         `json:"metode_pembayaran"`
    TipePembayaran   string         `json:"tipe_pembayaran"`
    JumlahDP         float64        `json:"jumlah_dp"`
    TanggalJatuhTempo time.Time     `json:"tanggal_jatuh_tempo"`
}
```

## Enum Values

| Model | Field | Nilai |
|-------|-------|-------|
| **User** | `Role` | `admin`, `penyewa` |
| **Kamar** | `Status` | `Tersedia`, `Terisi`, `Booked`, `Perbaikan` |
| **Penyewa** | `Role` | `guest`, `tenant`, `former_tenant` |
| **Pemesanan** | `StatusPemesanan` | `Pending`, `Confirmed`, `Cancelled`, `Active`, `Completed` |
| **Pembayaran** | `StatusPembayaran` | `Pending`, `Confirmed`, `Failed`, `Settled` |
| **Pembayaran** | `MetodePembayaran` | `midtrans`, `cash` |
| **Pembayaran** | `TipePembayaran` | `full`, `dp` |
| **PaymentReminder** | `StatusReminder` | `Pending`, `Paid`, `Expired` |

## Migration

GORM melakukan **auto-migration** saat server pertama kali start. Untuk migration SQL manual (misalnya menambah kolom baru), gunakan file di folder `be/migrations/`:

```bash
# Jalankan migration manual
cd be
bash run-migration.sh
# atau di Windows:
run-migration.bat
```

> [!IMPORTANT]
> Semua model menggunakan **soft delete** (`gorm.DeletedAt`). Data yang dihapus tidak benar-benar hilang dari database, hanya ditandai dengan timestamp `deleted_at`.

---

> [!NOTE]
> GORM akan otomatis membuat foreign key constraints berdasarkan tag `gorm:"foreignKey:..."` pada model.
