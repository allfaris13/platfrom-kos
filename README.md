# 🏡 Aplikasi Kos-Kosan Perum Alam Sigura Gura

> _Sistem Manajemen Kos Paling Mantap, Aman, dan Terpercaya!_

![Go](https://img.shields.io/badge/Backend-Go-blue?style=for-the-badge&logo=go)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)
![Postgres](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker)

Selamat datang di repo **Kos-Kosan Perum Alam Sigura Gura**! 😎
Repo ini berisi _brain_ (backend) dan _beauty_ (frontend) dari sistem manajemen kos kita.

---

## 🛋️ Fasilitas (Tech Stack)

Kita gak main-main soal teknologi, Gan. Fasilitas bintang lima! ⭐⭐⭐⭐⭐

| Area                      | Fasilitas        | Deskripsi                                                |
| :------------------------ | :--------------- | :------------------------------------------------------- |
| **Dapur (Backend)**       | **Golang + Gin** | Cepet banget, ngebut kayak motor ninja! 🏍️               |
| **Ruang Tamu (Frontend)** | **Next.js 16**   | Tampilan _sleek_ & modern buat manjain mata penghuni. ✨ |
| **Gudang (Database)**     | **PostgreSQL**   | Aman nyimpen data penghuni & duit setoran. 💰            |
| **Satpam (Auth)**         | **JWT + BCrypt** | Gak ada kunci duplikat di sini, aman terkendali! 🔒      |
| **Tukang Jaga (DevOps)**  | **Docker**       | Deploy di mana aja gampang, tinggal angkut! 🐳           |

---

## 🚀 Cara Jadi Juragan (How to Run)

Mau jalanin aplikasi ini? Gampang, ikutin petunjuk di bawah biar auto cuan! 💸

### 📦 Cara Sultan (Paling Gampang pake Docker)

Ini cara paling _recommended_ buat yang gak mau ribet. Cukup satu mantra:

```bash
docker compose up --build
```

Tunggu bentar sambil ngopi ☕, dan simsalabim:

- 🏠 **Frontend (Lobby):** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend (Kantor):** [http://localhost:8080](http://localhost:8080)
- 🗄️ **Database:** Lagi santai di Port `5432`

---

### 🛠️ Cara Tukang (Manual Setup)

Buat yang hobi ngoprek, nih caranya:

#### 1. Masuk ke Kantor (Backend)

```bash
cd be
make run       # Gasspol servernya!
```

#### 2. Masuk ke Lobby (Frontend)

```bash
cd fe
npm install    # Beli perabotan dulu
npm run dev    # Buka pintu lobby!
```

---

## 📜 Peraturan Kos (Development & Testing)

Biar kosan tetep rapi, tolong patuhi peraturan ya!

### 🧹 Bersih-Bersih (Linting)

Sebelum setor kode, pastiin kodenya kinclong:

```bash
cd be
make lint
```

### 🧪 Cek Kualitas (Testing)

Jangan sampe ada atap bocor (bug)! Test dulu:

```bash
cd be
make test
```

---

## 📂 Peta Lokasi (Folder Structure)

- `fe/` ➡️ **Frontend**: Tempat nongkrong anak kos (UI/UX).
- `be/` ➡️ **Backend**: Ruang mesin & kantor pengelola (Logic).
- `compose.yaml` ➡️ **Denah Gedung**: Konfigurasi Docker biar semua jalan bareng.

---

> _Dibuat dengan sedikit ☕ di Malang._
