# Database Migration Scripts

Folder ini berisi script helper untuk menjalankan database migrations dengan mudah.

## 🚀 Cara Penggunaan

### Untuk Windows (Batch Script) - RECOMMENDED ✅

1. **Double-click** file `run-migration.bat`, atau
2. Jalankan dari terminal:
   ```cmd
   cd c:\Users\Arkan\Documents\coding\platfrom-kos\be
   run-migration.bat
   ```

### Untuk Git Bash / Linux / Mac

1. Jalankan dari terminal:
   ```bash
   cd c:/Users/Arkan/Documents/coding/platfrom-kos/be
   chmod +x run-migration.sh
   ./run-migration.sh
   ```

## ⚙️ Konfigurasi

Jika database Anda berbeda dari default, edit konfigurasi di dalam script:

**run-migration.bat:**
```batch
set DB_USER=postgres
set DB_NAME=koskosan_db
set DB_HOST=localhost
set DB_PORT=5432
```

**run-migration.sh:**
```bash
DB_USER="postgres"
DB_NAME="koskosan_db"
DB_HOST="localhost"
DB_PORT="5432"
```

## 📝 Yang Dilakukan Script

1. ✅ Cek keberadaan file migration
2. ✅ Tampilkan konfigurasi database
3. ✅ Minta konfirmasi sebelum run
4. ✅ Jalankan migration SQL
5. ✅ Verifikasi hasil migration
6. ✅ Tampilkan sample data dengan role baru

## 🔍 Manual Verification

Jika ingin mengecek manual setelah migration:

```sql
-- Cek struktur tabel
\d+ penyewa

-- Cek data user dan role mereka
SELECT id, nama_lengkap, email, role FROM penyewa;

-- Cek index yang dibuat
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'penyewa';
```

## ⚠️ Troubleshooting

**Error: database "koskosan_db" does not exist**
- Periksa nama database Anda di `.env` atau `config.go`
- Update variable `DB_NAME` di script sesuai nama database yang benar

**Error: psql.exe not found**
- Pastikan path PostgreSQL sudah benar di variable `PSQL_PATH`
- Cek lokasi instalasi PostgreSQL Anda

**Error: FATAL: password authentication failed**
- Pastikan password PostgreSQL Anda benar
- Script akan meminta password saat dijalankan

## 📋 Migration File

File yang akan dijalankan: `migrations/add_role_to_penyewa.sql`

Isi migration:
- Menambahkan kolom `role` ke tabel `penyewa`
- Set default value `'guest'` untuk user baru
- Update existing users dengan pembayaran confirmed ke role `'tenant'`
- Membuat index untuk optimasi query
