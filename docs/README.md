# Project Documentation

Selamat datang di pusat dokumentasi untuk **Aplikasi Kos-Kosan Perum Alam Sigura Gura**!

## 📚 Dokumentasi Tersedia

### 🏗️ Arsitektur

- **[System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)** - Arsitektur sistem lengkap dengan diagram
  - Technology stack (Frontend & Backend)
  - Component architecture
  - Data flow diagrams
  - Security architecture
  - Deployment architecture
  - Performance & scalability

### 🗄️ Database

- **[Database Schema](./database/DATABASE_SCHEMA.md)** - Schema database lengkap
  - Entity Relationship Diagram (ERD)
  - Table structures
  - Foreign keys & constraints
  - Indexes & triggers
  - Common queries
  - Migration scripts

### 📖 Guides

- **[Development Setup](./guides/DEVELOPMENT_SETUP.md)** - Panduan setup development environment

  - Prerequisites & tools
  - Quick start dengan Docker
  - Manual setup (tanpa Docker)
  - IDE configuration
  - Development workflow
  - Common issues & solutions

- **[Deployment Guide](./guides/DEPLOYMENT.md)** - Panduan deployment ke production
  - Docker Compose deployment
  - Cloud platform deployment (Vercel, Railway)
  - Kubernetes deployment
  - Security checklist
  - Monitoring & logging
  - Backup strategy

## 📁 Struktur Folder Dokumentasi

```
docs/
├── architecture/
│   └── SYSTEM_ARCHITECTURE.md    # Arsitektur sistem
├── database/
│   └── DATABASE_SCHEMA.md        # Schema database
├── guides/
│   ├── DEVELOPMENT_SETUP.md      # Setup development
│   └── DEPLOYMENT.md             # Deployment guide
└── README.md                     # File ini
```

## 🚀 Quick Links

### Untuk Developer Baru

1. Mulai dengan [Development Setup Guide](./guides/DEVELOPMENT_SETUP.md)
2. Pahami [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
3. Pelajari [Database Schema](./database/DATABASE_SCHEMA.md)
4. Check dokumentasi frontend di [/fe/docs](../fe/docs/)

### Untuk DevOps/Deployment

1. Review [System Architecture - Deployment Section](./architecture/SYSTEM_ARCHITECTURE.md#deployment-architecture)
2. Follow [Deployment Guide](./guides/DEPLOYMENT.md)
3. Setup monitoring & backups

### Untuk Database Administrator

1. Review [Database Schema](./database/DATABASE_SCHEMA.md)
2. Understand triggers & constraints
3. Setup backup strategy dari [Deployment Guide](./guides/DEPLOYMENT.md#backup-strategy)

## 🔗 Dokumentasi Tambahan

### Frontend

- [Frontend Architecture](../fe/docs/ARCHITECTURE.md)
- [State Management Guide](../fe/docs/STATE_MANAGEMENT_GUIDE.md)
- [State Management API Reference](../fe/docs/STATE_MANAGEMENT_SUMMARY.md)

### Backend

- API Documentation (Swagger): `http://localhost:8080/docs/index.html`
- Go code documentation: godoc di `be/` folder

### Project Root

- [Main README](../README.md) - Overview & quick start

## 📊 Diagram Overview

Dokumentasi ini menggunakan Mermaid untuk diagram:

**System Architecture Diagrams**:

- Overall system architecture
- Frontend component structure
- Backend layered architecture
- Data flow sequences
- Authentication flow
- Deployment topology

**Database Diagrams**:

- Entity Relationship Diagram (ERD)
- Table relationships
- Index structure

## 🛠️ Tech Stack Summary

| Component            | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | Next.js 15, React 18, TypeScript, Tailwind CSS |
| **Backend**          | Go 1.24, Gin Framework, GORM                   |
| **Database**         | PostgreSQL 15                                  |
| **State Management** | React Context API                              |
| **Deployment**       | Docker, Docker Compose                         |
| **CI/CD**            | GitHub Actions                                 |

## 📝 Contributing to Documentation

Jika menemukan kesalahan atau ingin menambahkan dokumentasi:

1. Fork repository
2. Buat branch baru: `git checkout -b docs/improvement`
3. Edit dokumentasi (gunakan Markdown)
4. Test Mermaid diagrams di [Mermaid Live Editor](https://mermaid.live/)
5. Commit: `git commit -m "docs: improve architecture documentation"`
6. Push dan create Pull Request

### Documentation Style Guide

- Gunakan Markdown formatting
- Include code examples dengan syntax highlighting
- Use Mermaid untuk diagram (bukan gambar)
- Tambahkan table of contents untuk dokumen panjang
- Link ke file/section lain dengan relative paths
- Keep diagrams simple dan mudah dibaca

## 🔍 Cari Dokumentasi

Gunakan search di GitHub atau grep:

```bash
# Search dalam dokumentasi
grep -r "authentication" docs/

# Find specific diagram
grep -r "mermaid" docs/
```

## 📞 Need Help?

- **General questions**: Check [Main README](../README.md)
- **Setup issues**: See [Development Setup](./guides/DEVELOPMENT_SETUP.md#common-issues--solutions)
- **Deployment issues**: See [Deployment Guide](./guides/DEPLOYMENT.md#troubleshooting)
- **Architecture questions**: Review [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- **Database questions**: Review [Database Schema](./database/DATABASE_SCHEMA.md)

## 📅 Documentation Updates

This documentation is maintained alongside the codebase:

- **Last Updated**: January 2026
- **Version**: 1.0
- **Maintainers**: Development Team

---

> 💡 **Tip**: Bookmark halaman ini untuk akses cepat ke semua dokumentasi!
