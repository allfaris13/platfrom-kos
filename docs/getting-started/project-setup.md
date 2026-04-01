# Project Setup

Tutorial lengkap untuk menjalankan Platform Kos di lingkungan development lokal.

## Prerequisites

Pastikan tools berikut sudah terinstall:

| Tool | Versi Minimum | Cek Instalasi |
|------|--------------|---------------|
| **Git** | 2.x | `git --version` |
| **Go** | 1.24+ | `go version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **PostgreSQL** | 15+ | `psql --version` |
| **Docker** *(opsional)* | 24+ | `docker --version` |

## Langkah 1: Clone Repository

```bash
git clone https://github.com/<your-org>/platfrom-kos.git
cd platfrom-kos
```

Struktur folder utama:

```
platfrom-kos/
├── be/                 # Backend (Go + Gin)
├── fe/                 # Frontend (Next.js)
├── docs/               # Dokumentasi
├── nginx/              # Nginx reverse proxy config
├── docker-compose.yml  # Docker orchestration
├── deploy.sh           # Deployment script
└── README.md
```

## Langkah 2: Setup Backend

### 2.1 Konfigurasi Environment

```bash
cd be
cp .env.example .env
```

Edit file `.env` sesuai environment lokal Anda:

```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=change_me_to_your_password
DB_NAME=koskosan_db
DB_PORT=5432

# Security (WAJIB - Generate dengan: openssl rand -base64 32)
JWT_SECRET=CHANGE_ME_minimum_32_characters_required_here

# Application
PORT=8081
GIN_MODE=debug
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Cloudinary (Opsional - untuk production)
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Google OAuth 2.0 (Opsional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=http://localhost:8081/api/auth/google/callback

# SMTP Email (Opsional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=
```

Sumber: [`be/.env.example`](file:///home/arkan/coding/UPK_semester_2/be/.env.example)

> [!WARNING]
> `JWT_SECRET` **wajib** minimal 32 karakter. Tanpa ini, server tidak akan bisa start.

### 2.2 Buat Database

```bash
# Masuk ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE koskosan_db;
\q
```

### 2.3 Install Dependencies & Jalankan

```bash
# Download Go modules
go mod download

# Jalankan server
go run cmd/api/main.go
```

Atau gunakan Makefile:

```bash
make run     # Jalankan server
make build   # Build binary
make lint    # Jalankan linter
```

Sumber: [`be/Makefile`](file:///home/arkan/coding/UPK_semester_2/be/Makefile)

Output yang diharapkan:

```
Database initialized and migrated successfully on PostgreSQL
All handlers initialized successfully
Server started on port 8081
Server running on http://localhost:8081
```

> [!NOTE]
> GORM akan **auto-migrate** semua tabel saat pertama kali server dijalankan. Tidak perlu menjalankan SQL migration secara manual.

> [!CAUTION]
> Di lingkungan **Production**, backend menggunakan port **8087** dan frontend port **3007** (sesuai konfigurasi `Caddyfile`). Pastikan port ini tidak tertukar dengan default development (8081/3000).

### 2.4 Mengisi Data Awal (Seeding)

Project ini menyertakan file **Seed Data** untuk memudahkan testing dengan akun admin dan data penyewa dummy.

**File Seed**:
- [`be/docs/seed_admin.json`](file:///home/arkan/coding/UPK_semester_2/be/docs/seed_admin.json)
- [`be/docs/seed_tenant_guest.json`](file:///home/arkan/coding/UPK_semester_2/be/docs/seed_tenant_guest.json)

**Cara Menjalankan Seed**:
Kamu bisa menggunakan script yang ada di folder `be`:

```bash
# Untuk Linux/macOS
cd be
bash run-migration.sh
```

Script ini akan menjalankan migration SQL tambahan dan menginisialisasi database dengan data awal. Akun default setelah seeding:
- **Username**: `admin`
- **Password**: `password123` (Cek detail di file JSON jika tidak berhasil)

## Langkah 3: Setup Frontend

### 3.1 Konfigurasi Environment

```bash
cd fe
cp .env.example .env.local
```

Edit file `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_API_BASE=/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Kos-Kosan Alam Sigura Gura
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Sumber: [`fe/.env.example`](file:///home/arkan/coding/UPK_semester_2/fe/.env.example)

> [!IMPORTANT]
> `NEXT_PUBLIC_API_URL` harus mengarah ke backend yang sudah berjalan. Port default backend adalah `8081`.

### 3.2 Install Dependencies & Jalankan

```bash
npm install
npm run dev
```

Output yang diharapkan:

```
▲ Next.js 16.x
- Local: http://localhost:3000
```

Buka browser di `http://localhost:3000` untuk melihat aplikasi.

## Langkah 4: Setup via Docker (Alternatif)

Jika ingin menjalankan seluruh stack sekaligus menggunakan Docker:

### 4.1 Konfigurasi

```bash
# Di root folder project
cp .env.production .env
# Edit .env sesuai kebutuhan
```

### 4.2 Jalankan Docker Compose

```bash
docker compose up --build -d
```

Docker Compose akan menjalankan 4 container:

```yaml
# Dari docker-compose.yml
services:
  postgres:        # PostgreSQL 15 (port 5432)
    image: postgres:15-alpine

  backend:         # Go API (port 8080)
    build: ./be

  frontend:        # Next.js (port 3000)
    build: ./fe

  nginx:           # Reverse Proxy (port 80, 443)
    image: nginx:alpine
```

Sumber: [`docker-compose.yml`](file:///home/arkan/coding/UPK_semester_2/docker-compose.yml)

### 4.3 Verifikasi

```bash
# Cek semua container berjalan
docker compose ps

# Cek health backend
curl http://localhost:8080/api/health

# Cek frontend
curl http://localhost:3000
```

### 4.4 Hentikan

```bash
docker compose down               # Stop containers
docker compose down -v             # Stop + hapus volumes (data DB hilang)
```

## Langkah 5: Verifikasi Setup

Setelah backend dan frontend berjalan, cek:

| Endpoint | URL | Expected |
|----------|-----|----------|
| Backend Health | `GET http://localhost:8081/api/health` | `{"status":"ok"}` |
| Daftar Kamar | `GET http://localhost:8081/api/kamar` | JSON array kamar |
| Frontend | `http://localhost:3000` | Halaman utama |
| Prometheus | `http://localhost:8081/metrics` | Metrics data |

---

> [!TIP]
> Jika port 8080 sudah terpakai, gunakan script `kill_8080.ps1` di root project (Windows) atau ubah `PORT` di `.env`.
