# System Architecture

## Overview

Aplikasi Kos-Kosan Perum Alam Sigura Gura adalah full-stack web application yang menggunakan arsitektur modern dengan pemisahan frontend dan backend.

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Animations**: Framer Motion
- **HTTP Client**: Fetch API
- **Date Library**: date-fns

### Backend

- **Language**: Go 1.24
- **Web Framework**: Gin
- **Database**: PostgreSQL 15
- **ORM**: GORM
- **Authentication**: JWT
- **Password Hashing**: BCrypt
- **API Documentation**: Swagger/OpenAPI

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: (Future: Nginx/Caddy)
- **CI/CD**: GitHub Actions

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["🌐 Web Browser"]
        Mobile["📱 Mobile Browser"]
    end

    subgraph "Frontend Layer"
        NextJS["Next.js 15 App<br/>Port: 3000"]
        SSR["Server-Side Rendering"]
        NextJS --> SSR
    end

    subgraph "Backend Layer"
        API["Go/Gin API Server<br/>Port: 8080"]
        Auth["JWT Auth Middleware"]
        Handlers["HTTP Handlers"]
        Services["Business Logic"]
        Repositories["Data Access Layer"]

        API --> Auth
        Auth --> Handlers
        Handlers --> Services
        Services --> Repositories
    end

    subgraph "Data Layer"
        PostgreSQL["PostgreSQL Database<br/>Port: 5432"]
        LocalStorage["Browser LocalStorage"]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS -.REST API.-> API
    Repositories --> PostgreSQL
    NextJS --> LocalStorage

    style NextJS fill:#0070f3,stroke:#333,stroke-width:2px,color:#fff
    style API fill:#00ADD8,stroke:#333,stroke-width:2px,color:#fff
    style PostgreSQL fill:#336791,stroke:#333,stroke-width:2px,color:#fff
```

## Component Architecture

### Frontend Architecture

```mermaid
graph LR
    subgraph "Pages (Routes)"
        Home["/"]
        Admin["/admin"]
        Account["/account"]
    end

    subgraph "Components"
        UI["UI Components<br/>(shadcn/ui)"]
        Shared["Shared Components<br/>(Login, ImageWithFallback)"]
        AdminComp["Admin Components"]
        TenantComp["Tenant Components"]
    end

    subgraph "State Management"
        Context["AppContext<br/>(Global State)"]
        LocalStore["LocalStorage<br/>(Persistence)"]
    end

    subgraph "Services"
        APIClient["API Client<br/>(api.ts)"]
    end

    Home --> TenantComp
    Admin --> AdminComp
    TenantComp --> UI
    AdminComp --> UI
    TenantComp --> Shared
    AdminComp --> Shared

    TenantComp --> Context
    AdminComp --> Context
    Context --> LocalStore

    TenantComp --> APIClient
    AdminComp --> APIClient
    APIClient -.HTTP.-> Backend["Backend API"]
```

### Backend Architecture (Go)

```mermaid
graph TD
    subgraph "HTTP Layer"
        Router["Gin Router"]
        Middleware["Middleware<br/>(CORS, Auth, Logger)"]
    end

    subgraph "Handler Layer"
        KamarHandler["Kamar Handler"]
        ReviewHandler["Review Handler"]
        UserHandler["User Handler"]
        BookingHandler["Booking Handler"]
    end

    subgraph "Service Layer"
        KamarService["Kamar Service"]
        ReviewService["Review Service"]
        UserService["User Service"]
        BookingService["Booking Service"]
    end

    subgraph "Repository Layer"
        KamarRepo["Kamar Repository"]
        ReviewRepo["Review Repository"]
        UserRepo["User Repository"]
        BookingRepo["Booking Repository"]
    end

    subgraph "Database Layer"
        GORM["GORM ORM"]
        Postgres["PostgreSQL"]
    end

    Router --> Middleware
    Middleware --> KamarHandler
    Middleware --> ReviewHandler
    Middleware --> UserHandler
    Middleware --> BookingHandler

    KamarHandler --> KamarService
    ReviewHandler --> ReviewService
    UserHandler --> UserService
    BookingHandler --> BookingService

    KamarService --> KamarRepo
    ReviewService --> ReviewRepo
    UserService --> UserRepo
    BookingService --> BookingRepo

    KamarRepo --> GORM
    ReviewRepo --> GORM
    UserRepo --> GORM
    BookingRepo --> GORM

    GORM --> Postgres
```

## Data Flow

### User Booking Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Context
    participant LocalStorage
    participant Backend
    participant Database

    User->>Frontend: Browse rooms
    Frontend->>Backend: GET /api/kamar
    Backend->>Database: SELECT * FROM kamar
    Database-->>Backend: Room data
    Backend-->>Frontend: JSON response

    User->>Frontend: Click "Book Now"
    Frontend->>Frontend: Show booking form
    User->>Frontend: Fill booking details

    Frontend->>Context: addBooking(data)
    Context->>LocalStorage: Save to localStorage
    Context->>Backend: POST /api/bookings (future)
    Backend->>Database: INSERT INTO bookings
    Database-->>Backend: Success
    Backend-->>Frontend: Booking confirmed
    Frontend-->>User: Show success message
```

### Admin Room Management Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Open Room Management
    Frontend->>Backend: GET /api/kamar
    Backend->>Database: SELECT * FROM kamar
    Database-->>Backend: All rooms
    Backend-->>Frontend: Room list

    Admin->>Frontend: Update room status
    Frontend->>Backend: PUT /api/kamar/:id
    Backend->>Database: UPDATE kamar SET status=?
    Database-->>Backend: Success
    Backend-->>Frontend: Updated room

    Frontend->>Frontend: Update UI
    Frontend-->>Admin: Show updated status
```

## API Architecture

### RESTful Endpoints

| Method   | Endpoint                 | Description          | Auth Required |
| -------- | ------------------------ | -------------------- | ------------- |
| `GET`    | `/api/kamar`             | Get all rooms        | No            |
| `GET`    | `/api/kamar/:id`         | Get room by ID       | No            |
| `POST`   | `/api/kamar`             | Create new room      | Yes (Admin)   |
| `PUT`    | `/api/kamar/:id`         | Update room          | Yes (Admin)   |
| `DELETE` | `/api/kamar/:id`         | Delete room          | Yes (Admin)   |
| `GET`    | `/api/reviews/:kamar_id` | Get reviews for room | No            |
| `POST`   | `/api/reviews`           | Create review        | Yes           |
| `POST`   | `/api/auth/login`        | User login           | No            |
| `POST`   | `/api/auth/register`     | User registration    | No            |
| `GET`    | `/api/bookings`          | Get all bookings     | Yes (Admin)   |
| `POST`   | `/api/bookings`          | Create booking       | Yes           |

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: SELECT user WHERE email=?
    Database-->>Backend: User data (hashed password)
    Backend->>Backend: bcrypt.Compare(password, hash)

    alt Password valid
        Backend->>Backend: Generate JWT token
        Backend-->>Frontend: {token, user}
        Frontend->>Frontend: Store token in localStorage
        Frontend-->>User: Redirect to dashboard
    else Password invalid
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end
```

### JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": 123,
    "email": "user@example.com",
    "role": "tenant",
    "exp": 1234567890
  }
}
```

## Deployment Architecture

### Development Environment

```mermaid
graph LR
    Dev["Developer Machine"]

    subgraph "Docker Compose"
        FE["Frontend<br/>localhost:3000"]
        BE["Backend<br/>localhost:8080"]
        DB["PostgreSQL<br/>localhost:5432"]
    end

    Dev --> FE
    Dev --> BE
    FE --> BE
    BE --> DB
```

### Production Environment (Future)

```mermaid
graph TB
    Users["Users"]

    subgraph "Cloud Provider"
        LB["Load Balancer"]

        subgraph "Frontend Servers"
            FE1["Next.js Instance 1"]
            FE2["Next.js Instance 2"]
        end

        subgraph "Backend Servers"
            BE1["Go API Instance 1"]
            BE2["Go API Instance 2"]
        end

        subgraph "Database Cluster"
            DBMaster["PostgreSQL Primary"]
            DBReplica["PostgreSQL Replica"]
        end

        Redis["Redis Cache"]
    end

    Users --> LB
    LB --> FE1
    LB --> FE2
    FE1 --> BE1
    FE1 --> BE2
    FE2 --> BE1
    FE2 --> BE2
    BE1 --> Redis
    BE2 --> Redis
    BE1 --> DBMaster
    BE2 --> DBMaster
    DBMaster -.Replication.-> DBReplica
```

## Performance Considerations

### Frontend Optimization

- **Server-Side Rendering**: Next.js SSR for faster initial page load
- **Code Splitting**: Automatic code splitting per route
- **Image Optimization**: Custom ImageWithFallback component
- **Client-Side Caching**: LocalStorage for persistent state
- **Lazy Loading**: Dynamic imports for heavy components

### Backend Optimization

- **Connection Pooling**: Database connection pool
- **Caching Strategy**: (Future: Redis for API responses)
- **Indexing**: Database indexes on frequently queried fields
- **Pagination**: Limit result sets for large queries
- **Gzip Compression**: Response compression

## Scalability Strategy

### Horizontal Scaling

- Multiple frontend instances behind load balancer
- Multiple backend API instances
- Database read replicas for read-heavy operations

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Add caching layer

## Monitoring & Logging

### Logging Strategy

- **Frontend**: Console logs (development), Error tracking (production)
- **Backend**: Structured logging with log levels
- **Database**: Query logs for slow queries

### Metrics to Track

- API response times
- Database query performance
- Error rates
- User activity
- System resource usage

## Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Payment gateway integration
- [ ] Email service for notifications
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA)
