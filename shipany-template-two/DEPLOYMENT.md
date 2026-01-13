# PD Note - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Before deploying, ensure all required environment variables are set:

#### Required Variables
```bash
# Application Settings
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="PD Note"
NEXT_PUBLIC_THEME="default"
NEXT_PUBLIC_APPEARANCE="system"

# Database (PostgreSQL recommended)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://user:password@host:5432/database"
DB_SINGLETON_ENABLED="true"
DB_MAX_CONNECTIONS="10"

# Authentication
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-generated-secret-here"

# Email (Optional but recommended)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Storage (Optional)
STORAGE_PROVIDER="local" # or "s3", "cloudflare-r2"
```

### 2. Security Checklist
- [ ] Change default `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure database with strong credentials
- [ ] Enable SSL/TLS for database connections
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting for API routes
- [ ] Review and update `.env.production` file

### 3. Database Setup
```bash
# Run database migrations
pnpm db:push

# Initialize RBAC roles
pnpm rbac:init

# (Optional) Assign admin role to first user
pnpm rbac:assign
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Quick Deploy)

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd shipany-template-two
vercel --prod
```

#### Step 4: Configure Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables from `.env.example`
3. Redeploy the application

#### Important Vercel Settings
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Output Directory**: `.next`
- **Node Version**: 20.x

**Database Recommendations for Vercel:**
- [Neon](https://neon.tech) - Serverless PostgreSQL (Free tier available)
- [Supabase](https://supabase.com) - PostgreSQL with Auth & Storage
- [PlanetScale](https://planetscale.com) - MySQL (if switching DB provider)

---

### Option 2: Docker Deployment

#### Step 1: Build Docker Image
```bash
cd shipany-template-two
docker build -t pdnote:latest .
```

#### Step 2: Run Container
```bash
docker run -d \
  --name pdnote \
  -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="your-secret" \
  pdnote:latest
```

#### Step 3: Use Docker Compose (Recommended)
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
      - DATABASE_URL=postgresql://postgres:password@db:5432/pdnote
      - AUTH_SECRET=${AUTH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=pdnote
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

### Option 3: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Step 1: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

#### Step 2: Clone and Setup
```bash
# Clone your repository
git clone https://github.com/venokacode/ccnote.git
cd ccnote/shipany-template-two

# Install dependencies
pnpm install --frozen-lockfile

# Create production env file
cp .env.example .env.production
nano .env.production  # Edit with your values

# Build application
pnpm build
```

#### Step 3: Run with PM2
```bash
# Start application
pm2 start npm --name "pdnote" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 4: Setup Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 5: Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🗄️ Database Setup

### PostgreSQL (Recommended)

#### Local PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE pdnote;
CREATE USER pdnote_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pdnote TO pdnote_user;
\q

# Connection string
DATABASE_URL="postgresql://pdnote_user:secure_password@localhost:5432/pdnote"
```

#### Cloud PostgreSQL Options
1. **Neon** (Serverless): https://neon.tech
2. **Supabase**: https://supabase.com
3. **Railway**: https://railway.app
4. **Render**: https://render.com

---

## 🔧 Post-Deployment

### 1. Initialize Database
```bash
pnpm db:push
pnpm rbac:init
```

### 2. Create First Admin User
1. Sign up through the web interface: `https://your-domain.com/sign-up`
2. Assign admin role:
```bash
pnpm rbac:assign
# Enter the user email when prompted
# Select "admin" role
```

### 3. Configure Settings
1. Login as admin
2. Navigate to `/admin/settings`
3. Configure:
   - Application name and URL
   - Email settings (SMTP)
   - Payment providers (Stripe/PayPal)
   - AI integrations (if needed)
   - Storage settings

### 4. Test All Features
- [ ] User registration and login
- [ ] Note creation and management
- [ ] Reminders functionality
- [ ] Comments feature
- [ ] Email notifications
- [ ] Admin panel access
- [ ] Settings persistence

---

## 📊 Monitoring

### Application Logs
```bash
# PM2 logs
pm2 logs pdnote

# Docker logs
docker logs -f pdnote

# Vercel logs
vercel logs
```

### Database Health
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Monitor active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Run migrations
pnpm db:push

# Rebuild
pnpm build

# Restart (PM2)
pm2 restart pdnote

# Restart (Docker)
docker-compose restart app
```

### Backup Database
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260113.sql
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check firewall/security groups
```

#### 2. Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

#### 3. Authentication Issues
```bash
# Regenerate AUTH_SECRET
openssl rand -base64 32

# Update in environment variables and restart
```

#### 4. Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS='--max-old-space-size=4096' pnpm build
```

---

## 📞 Support

- **GitHub Issues**: https://github.com/venokacode/ccnote/issues
- **Email**: support@prodentshop.com
- **Documentation**: See README.md and QUICK_START.md

---

## 📝 License

See [LICENSE](./LICENSE) file for details.
