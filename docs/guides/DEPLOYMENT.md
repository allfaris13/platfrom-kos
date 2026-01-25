# Deployment Guide

## Overview

Panduan deployment untuk aplikasi Kos-Kosan ke production environment.

## Deployment Options

### Option 1: Docker Compose (Recommended untuk MVP)

Cara termudah untuk deploy ke VPS atau cloud server.

#### Prerequisites

- VPS dengan minimum 2GB RAM
- Docker & Docker Compose terinstall
- Domain name (optional, bisa pakai IP)
- SSL certificate (recommended dengan Let's Encrypt)

#### Step-by-Step

**1. Prepare Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create app directory
mkdir -p /opt/koskosan
cd /opt/koskosan
```

**2. Clone Repository**

```bash
git clone https://github.com/allfaris13/platfrom-kos.git .
```

**3. Configure Environment**

```bash
# Backend environment
cp be/.env.example be/.env
nano be/.env
```

Update values untuk production:

```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=tugas_arkan

SERVER_PORT=8080
GIN_MODE=release

JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING

ALLOWED_ORIGINS=https://yourdomain.com
```

```bash
# Frontend environment
cp fe/.env.local.example fe/.env.local
nano fe/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Or if using same domain: http://yourdomain.com:8080
```

**4. Modify Docker Compose for Production**

Create `compose.prod.yaml`:

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    container_name: koskosan_db_prod
    environment:
      POSTGRES_DB: tugas_arkan
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - koskosan_network

  backend:
    build:
      context: ./be
      dockerfile: Dockerfile
    container_name: koskosan_backend_prod
    ports:
      - "8080:8080"
    environment:
      - GIN_MODE=release
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - koskosan_network

  frontend:
    build:
      context: ./fe
      dockerfile: Dockerfile
    container_name: koskosan_frontend_prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - koskosan_network

volumes:
  postgres_data:

networks:
  koskosan_network:
    driver: bridge
```

**5. Deploy**

```bash
# Build and start
docker compose -f compose.prod.yaml up -d --build

# Check logs
docker compose -f compose.prod.yaml logs -f

# Check status
docker compose -f compose.prod.yaml ps
```

**6. Setup Nginx Reverse Proxy (Optional but Recommended)**

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/koskosan
```

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/koskosan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Setup SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

### Option 2: Cloud Platform (Vercel + Railway/Render)

#### Frontend on Vercel

**1. Push to GitHub**

```bash
git push origin main
```

**2. Deploy to Vercel**

- Login ke [vercel.com](https://vercel.com)
- Click "New Project"
- Import GitHub repository
- Root Directory: `fe`
- Framework Preset: Next.js
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
  ```
- Deploy!

#### Backend on Railway

**1. Create Railway Account**

- Login ke [railway.app](https://railway.app)

**2. New Project → Deploy from GitHub**

- Select repository
- Set root directory: `be`

**3. Add PostgreSQL Database**

- New → Database → PostgreSQL
- Copy DATABASE_URL

**4. Environment Variables**

```env
DATABASE_URL=postgresql://...
GIN_MODE=release
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**5. Deploy Settings**

- Build Command: `go build -o server cmd/server/main.go`
- Start Command: `./server`
- Port: `8080`

---

### Option 3: Kubernetes (For Advanced Users)

Create Kubernetes manifests in `k8s/` directory:

**namespace.yaml**:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: koskosan
```

**postgres-deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: koskosan
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          env:
            - name: POSTGRES_DB
              value: tugas_arkan
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

Deploy:

```bash
kubectl apply -f k8s/
```

---

## Database Migration

### Before First Deploy

```bash
# Connect to production database
psql -h your-db-host -U postgres -d tugas_arkan

# Run migration scripts
\i schema.sql
\i seed.sql
```

### For Updates

```bash
# Backup first!
pg_dump -h your-db-host -U postgres tugas_arkan > backup_$(date +%Y%m%d).sql

# Run migration
\i migration_v2.sql
```

---

## Monitoring & Logging

### Docker Logs

```bash
# View all logs
docker compose logs

# Follow specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 frontend
```

### Setup Log Rotation

Create `/etc/logrotate.d/docker-container`:

```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=10M
  missingok
  delaycompress
  copytruncate
}
```

### Health Checks

Add to `compose.prod.yaml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## Backup Strategy

### Automated Database Backup

Create `/opt/backup/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backup/db"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="koskosan_backup_$DATE.sql"

# Create backup
docker exec koskosan_db_prod pg_dump -U postgres tugas_arkan > "$BACKUP_DIR/$FILENAME"

# Compress
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
```

Make executable and add to cron:

```bash
chmod +x /opt/backup/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /opt/backup/backup.sh >> /var/log/backup.log 2>&1
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall (UFW)
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Implement rate limiting
- [ ] Setup fail2ban
- [ ] Enable database backups

### Firewall Setup

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

---

## Performance Optimization

### Frontend

- Enable Next.js Image Optimization
- Configure CDN (Vercel Edge Network)
- Enable compression in Nginx
- Cache static assets

### Backend

- Enable Gzip compression
- Database connection pooling
- Add Redis for caching (future)
- Load balancing with multiple instances

### Database

```sql
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_kamar_status ON kamar(status);
CREATE INDEX IF NOT EXISTS idx_review_kamar ON review(kamar_id);

-- Regular maintenance
VACUUM ANALYZE;
```

---

## Rollback Procedure

In case of deployment failure:

```bash
# Stop current deployment
docker compose down

# Restore database
gunzip < backup_YYYYMMDD.sql.gz | psql -h db -U postgres tugas_arkan

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose up -d --build
```

---

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate valid
- [ ] Database migrations successful
- [ ] All API endpoints working
- [ ] Frontend loads correctly
- [ ] Authentication working
- [ ] File uploads functional (if any)
- [ ] Email notifications working (if configured)
- [ ] Monitoring setup complete
- [ ] Backups configured and tested
- [ ] DNS records updated
- [ ] Performance acceptable
- [ ] Error logging functional

---

## Troubleshooting

### Common Issues

**Application not starting**:

```bash
docker compose logs backend
docker compose logs frontend
```

**Database connection failed**:

```bash
docker exec -it koskosan_db_prod psql -U postgres
\conninfo
```

**High memory usage**:

```bash
docker stats
# Consider adding resource limits to docker-compose
```

**SSL certificate issues**:

```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

---

## Updating the Application

```bash
cd /opt/koskosan

# Pull updates
git pull origin main

# Rebuild and restart
docker compose -f compose.prod.yaml build
docker compose -f compose.prod.yaml up -d

# Check health
docker compose ps
```

---

## Support & Maintenance

- Monitor application health daily
- Review logs weekly
- Update dependencies monthly
- Test backups quarterly
- Security audit semi-annually

Happy Deploying! 🚀
