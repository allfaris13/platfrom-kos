# Development Setup Guide

## Prerequisites

Sebelum memulai development, pastikan system Anda sudah terinstall:

### Required Software

| Software              | Minimum Version | Download Link                                          |
| --------------------- | --------------- | ------------------------------------------------------ |
| **Docker**            | 20.10+          | [docker.com](https://www.docker.com/get-started)       |
| **Docker Compose**    | 2.0+            | Included with Docker Desktop                           |
| **Git**               | 2.30+           | [git-scm.com](https://git-scm.com/downloads)           |
| **Go**                | 1.23+           | [go.dev](https://go.dev/dl/)                           |
| **Node.js**           | 18.0+           | [nodejs.org](https://nodejs.org/)                      |
| **PostgreSQL Client** | 15+             | [postgresql.org](https://www.postgresql.org/download/) |
| **Make**              | 4.0+            | Pre-installed on Linux/Mac                             |

### Optional Tools

- **VS Code** - Recommended IDE dengan ekstensi Go dan TypeScript
- **Postman** / **Insomnia** - For API testing
- **pgAdmin** / **DBeaver** - Database management GUI

---

## Quick Start (Docker)

Cara tercepat untuk memulai development.

### 1. Clone Repository

```bash
git clone https://github.com/allfaris13/platfrom-kos.git
cd platfrom-kos
```

### 2. Start All Services

```bash
docker compose up --build
```

Tunggu hingga semua service berjalan:

- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:8080
- ✅ Database: localhost:5432
- ✅ API Docs: http://localhost:8080/docs/index.html

### 3. Verify Installation

```bash
# Check frontend
curl http://localhost:3000

# Check backend
curl http://localhost:8080/api/kamar

# Check database
docker compose exec db psql -U postgres -d tugas_arkan -c "\dt"
```

---

## Manual Setup (Without Docker)

Untuk development yang lebih flexible.

### Step 1: Setup Database

#### Install PostgreSQL

**Ubuntu/Debian**:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS** (with Homebrew):

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows**:
Download installer dari [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Login sebagai postgres user
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE tugas_arkan;
CREATE USER postgres WITH PASSWORD '12345678';
GRANT ALL PRIVILEGES ON DATABASE tugas_arkan TO postgres;

# Exit
\q
```

#### Verify Database Connection

```bash
psql -h localhost -U postgres -d tugas_arkan
```

### Step 2: Setup Backend

#### Install Go Dependencies

```bash
cd be
go mod download
go mod tidy
```

#### Configure Environment

Buat file `.env` di folder `be/`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=12345678
DB_NAME=tugas_arkan

# Server Configuration
SERVER_PORT=8080
GIN_MODE=debug

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000
```

#### Run Database Migrations

```bash
# Jalankan migrations (jika ada)
go run cmd/server/main.go migrate

# Atau gunakan Makefile
make migrate
```

#### Start Backend Server

```bash
# Opsi 1: Langsung dengan go
go run cmd/server/main.go

# Opsi 2: Menggunakan Makefile
make run

# Opsi 3: Build binary dulu
make build
./bin/server
```

Backend sekarang berjalan di http://localhost:8080

### Step 3: Setup Frontend

#### Install Node.js Dependencies

```bash
cd fe
npm install
```

#### Configure Environment

Buat file `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE=/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Kos-Kosan Alam Sigura Gura
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Start Development Server

```bash
npm run dev
```

Frontend sekarang berjalan di http://localhost:3000

---

## IDE Setup

### VS Code Recommended Extensions

#### Frontend Development

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

#### Backend Development

```json
{
  "recommendations": [
    "golang.go",
    "ms-vscode.makefile-tools",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg"
  ]
}
```

### VS Code Settings

Buat `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[go]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "golang.go"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": "workspace"
}
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/nama-fitur
```

### 2. Backend Development

```bash
cd be

# Run in watch mode (development)
make run

# Run tests
make test

# Lint code
make lint

# Format code
go fmt ./...
```

### 3. Frontend Development

```bash
cd fe

# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Build for production
npm run build
```

### 4. Database Operations

```bash
# Connect to database
psql -h localhost -U postgres -d tugas_arkan

# View tables
\dt

# Describe table structure
\d kamar

# Run SQL file
psql -h localhost -U postgres -d tugas_arkan < script.sql

# Backup database
pg_dump -U postgres tugas_arkan > backup.sql

# Restore database
psql -U postgres tugas_arkan < backup.sql
```

### 5. Testing

#### Backend Testing

```bash
cd be
go test ./... -v
go test -cover ./internal/...
```

#### Frontend Testing

```bash
cd fe
npm run test
npm run test:watch
```

---

## Common Issues & Solutions

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U postgres -d tugas_arkan
```

### Go Module Issues

```bash
# Clear module cache
go clean -modcache

# Re-download modules
go mod download
go mod tidy
```

### Node Module Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

**Frontend**:

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Backend**:

```bash
# Use fresh restart
make clean
make run
```

---

## Environment Variables Reference

### Backend `.env`

| Variable          | Description              | Default     | Required |
| ----------------- | ------------------------ | ----------- | -------- |
| `DB_HOST`         | Database host            | localhost   | Yes      |
| `DB_PORT`         | Database port            | 5432        | Yes      |
| `DB_USER`         | Database username        | postgres    | Yes      |
| `DB_PASSWORD`     | Database password        | -           | Yes      |
| `DB_NAME`         | Database name            | tugas_arkan | Yes      |
| `SERVER_PORT`     | API server port          | 8080        | Yes      |
| `GIN_MODE`        | Gin mode (debug/release) | debug       | No       |
| `JWT_SECRET`      | JWT signing key          | -           | Yes      |
| `ALLOWED_ORIGINS` | CORS allowed origins     | \*          | No       |

### Frontend `.env.local`

| Variable               | Description      | Default               | Required |
| ---------------------- | ---------------- | --------------------- | -------- |
| `NEXT_PUBLIC_API_URL`  | Backend API URL  | http://localhost:8080 | Yes      |
| `NEXT_PUBLIC_API_BASE` | API base path    | /api                  | No       |
| `NEXT_PUBLIC_APP_NAME` | Application name | -                     | No       |

---

## Next Steps

After setup complete:

1. ✅ Read [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
2. ✅ Review [Database Schema](../database/DATABASE_SCHEMA.md)
3. ✅ Check [Frontend Architecture](../../fe/docs/ARCHITECTURE.md)
4. ✅ Explore API docs at http://localhost:8080/docs/index.html
5. ✅ Start building features!

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Create issue on GitHub
- **API Questions**: Check Swagger docs
- **Code Style**: Follow existing patterns

---

Happy Coding! 🚀
