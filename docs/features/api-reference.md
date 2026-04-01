# API Reference

Daftar lengkap semua endpoint API, dikelompokkan berdasarkan level akses.

Sumber: [`be/internal/routes/routes.go`](file:///home/arkan/coding/UPK_semester_2/be/internal/routes/routes.go)

```
http://localhost:8081/api
```

## Swagger Documentation

Project ini sekarang menyertakan spesifikasi **OpenAPI / Swagger** lengkap untuk mempermudah testing dan integrasi.

- **File**: [`be/docs/swagger.json`](file:///home/arkan/coding/UPK_semester_2/be/docs/swagger.json)
- **Cara Penggunaan**: Kamu bisa mengimpor file ini ke [Swagger Editor](https://editor.swagger.io/) atau Postman untuk melihat dokumentasi interaktif dan mencoba endpoint secara langsung.

## Public Routes (Tanpa Auth)

Endpoint yang bisa diakses tanpa login.

### Authentication

| Method | Endpoint | Handler | Rate Limit | Deskripsi |
|--------|----------|---------|------------|-----------|
| `POST` | `/auth/login` | `AuthHandler.Login` | Strict | Login dengan username & password |
| `POST` | `/auth/register` | `AuthHandler.Register` | Strict | Registrasi user baru |
| `POST` | `/auth/google-login` | `AuthHandler.GoogleLogin` | Strict | Login via Google OAuth |
| `POST` | `/auth/forgot-password` | `AuthHandler.ForgotPassword` | Strict | Kirim email reset password |
| `POST` | `/auth/reset-password` | `AuthHandler.ResetPassword` | Moderate | Reset password dengan token |
| `POST` | `/auth/refresh` | `AuthHandler.RefreshToken` | - | Refresh access token |
| `POST` | `/auth/logout` | `AuthHandler.Logout` | - | Logout & clear cookies |

### Kamar (Room Browsing)

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/kamar` | `KamarHandler.GetKamars` | Daftar semua kamar |
| `GET` | `/kamar/:id` | `KamarHandler.GetKamarByID` | Detail satu kamar |
| `GET` | `/kamar/:id/reviews` | `ReviewHandler.GetReviews` | Review untuk satu kamar |

### Lainnya

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/galleries` | `GalleryHandler.GetGalleries` | Semua foto galeri |
| `GET` | `/reviews` | `ReviewHandler.GetAllReviews` | Semua review |
| `POST` | `/contact` | `ContactHandler.HandleContactForm` | Kirim pesan kontak |

## Protected Routes (Auth Required)

Endpoint yang membutuhkan login (JWT cookie).

### Profile

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/profile` | `ProfileHandler.GetProfile` | Ambil profil user |
| `PUT` | `/profile` | `ProfileHandler.UpdateProfile` | Update profil (+ upload foto) |
| `PUT` | `/profile/change-password` | `ProfileHandler.ChangePassword` | Ganti password |

### Bookings

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/bookings` | `BookingHandler.GetMyBookings` | Daftar booking user |
| `POST` | `/bookings` | `BookingHandler.CreateBooking` | Buat booking baru |
| `POST` | `/bookings/with-proof` | `BookingHandler.CreateBookingWithProof` | Booking + upload bukti bayar |
| `POST` | `/bookings/:id/cancel` | `BookingHandler.CancelBooking` | Batalkan booking |
| `POST` | `/bookings/:id/extend` | `BookingHandler.ExtendBooking` | Perpanjang sewa |

### Payments

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `POST` | `/payments` | `PaymentHandler.CreatePayment` | Buat pembayaran |
| `POST` | `/payments/:id/proof` | `PaymentHandler.UploadPaymentProof` | Upload bukti transfer |
| `GET` | `/payments/reminders` | `PaymentHandler.GetReminders` | Pengingat pembayaran |

### Reviews

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `POST` | `/reviews` | `ReviewHandler.CreateReview` | Tulis review |

## Admin Routes (Auth + Role Admin)

Endpoint yang hanya bisa diakses oleh user dengan role `admin`.

### Room Management

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `POST` | `/kamar` | `KamarHandler.CreateKamar` | Tambah kamar baru |
| `PUT` | `/kamar/:id` | `KamarHandler.UpdateKamar` | Update data kamar |
| `DELETE` | `/kamar/:id` | `KamarHandler.DeleteKamar` | Hapus kamar |

### Gallery Management

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `POST` | `/galleries` | `GalleryHandler.CreateGallery` | Upload foto galeri |
| `DELETE` | `/galleries/:id` | `GalleryHandler.DeleteGallery` | Hapus foto galeri |

### Dashboard & Payment Management

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/dashboard` | `DashboardHandler.GetStats` | Statistik dashboard |
| `GET` | `/payments` | `PaymentHandler.GetAllPayments` | Semua pembayaran |
| `PUT` | `/payments/:id/confirm` | `PaymentHandler.ConfirmPayment` | Konfirmasi pembayaran transfer |
| `POST` | `/payments/confirm-cash/:id` | `PaymentHandler.ConfirmCashPayment` | Konfirmasi pembayaran cash |

### Tenant Management

| Method | Endpoint | Handler | Deskripsi |
|--------|----------|---------|-----------|
| `GET` | `/tenants` | `TenantHandler.GetAllTenants` | Daftar penyewa (+ pagination & search) |

## Contoh Request & Response

### Login

```bash
# Request
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Response (200 OK)
# Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
# Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Get Rooms

```bash
# Request
curl http://localhost:8081/api/kamar

# Response (200 OK)
[
  {
    "id": 1,
    "nomor_kamar": "A101",
    "tipe_kamar": "Standard",
    "harga_per_bulan": 1500000,
    "status": "Tersedia",
    "capacity": 1,
    "floor": 1,
    "image_url": "https://res.cloudinary.com/..."
  }
]
```

### Create Booking

```bash
# Request (perlu auth cookie)
curl -X POST http://localhost:8081/api/bookings \
  -H "Content-Type: application/json" \
  --cookie "access_token=..." \
  -d '{
    "kamar_id": 1,
    "tanggal_mulai": "2026-03-01T00:00:00Z",
    "durasi_sewa": 6
  }'

# Response (201 Created)
{
  "id": 1,
  "kamar_id": 1,
  "status_pemesanan": "Pending",
  "tanggal_mulai": "2026-03-01T00:00:00Z",
  "durasi_sewa": 6
}
```

## Monitoring

| Endpoint | Deskripsi |
|----------|-----------|
| `GET /metrics` | Prometheus metrics (request latency, error rates, dll) |
| `GET /api/health` | Health check endpoint |

---

> [!TIP]
> Semua endpoint yang membutuhkan auth akan otomatis membaca cookie `access_token`. Pastikan selalu mengirim `credentials: 'include'` dari frontend.
