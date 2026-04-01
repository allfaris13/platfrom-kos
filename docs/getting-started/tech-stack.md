# Technical Stack

Pemilihan teknologi didasarkan pada **performa**, **type safety**, dan **produktivitas developer**.

## Backend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Go](https://go.dev/) | 1.24.9 | Bahasa utama backend |
| [Gin Gonic](https://gin-gonic.com/) | v1.11.0 | HTTP web framework |
| [GORM](https://gorm.io/) | v1.31.1 | ORM untuk PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | 15 (Alpine) | Database relasional |
| [JWT](https://github.com/golang-jwt/jwt) | v5.3.0 | Token autentikasi |
| [Cloudinary](https://cloudinary.com/) | v2.14.1 | Cloud image hosting |
| [Prometheus](https://prometheus.io/) | - | Monitoring & metrics |
| [Cron](https://github.com/robfig/cron) | v3.0.1 | Scheduler (reminder) |
| [Gomail](https://github.com/go-gomail/gomail) | v2 | SMTP email sender |

Sumber: [`be/go.mod`](file:///home/arkan/coding/UPK_semester_2/be/go.mod)

## Frontend

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Next.js](https://nextjs.org/) | 16.1.6 (App Router) | React framework |
| [React](https://react.dev/) | 19.2.4 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [SWR](https://swr.vercel.app/) | 2.4.0 | Stale-while-revalidate data fetching |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | Utility-first CSS |
| [Shadcn UI](https://ui.shadcn.com/) (Radix) | - | Komponen UI (Dialog, Tabs, dll) |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animasi & transisi |
| [Recharts](https://recharts.org/) | 2.10.x | Chart untuk dashboard |
| [Zod](https://zod.dev/) | 3.22.x | Schema validation |
| [React Hook Form](https://react-hook-form.com/) | 7.51.x | Form management |

Sumber: [`fe/package.json`](file:///home/arkan/coding/UPK_semester_2/fe/package.json)

## Infrastructure

| Teknologi | Fungsi |
|-----------|--------|
| **Docker** | Containerization (multi-stage build) |
| **Docker Compose** | Orchestrasi multi-container |
| **Nginx** | Reverse proxy & SSL termination |
| **GitHub Actions** | CI/CD pipeline |
| **Cloudinary CDN** | Image delivery & optimization |

## Mengapa Stack Ini?

| Pilihan | Alasan |
|---------|--------|
| **Go** | Eksekusi sangat cepat, memory footprint rendah, ideal untuk concurrent booking |
| **SWR** | UI terasa "instant" dengan caching lokal, automatic revalidation |
| **HttpOnly Cookies** | Mitigasi XSS — token tidak bisa diakses JavaScript |
| **Cloudinary** | Offload image processing, server tetap ringan |
| **GORM** | ORM yang mature untuk Go, auto-migration, relationship support |
| **Shadcn UI** | Komponen yang accessible dan customizable, bukan dependency berat |
| **Zod + React Hook Form** | Validasi form yang type-safe end-to-end |

---

> [!NOTE]
> Semua versi di atas diambil langsung dari `go.mod` dan `package.json` pada saat penulisan dokumentasi ini.
