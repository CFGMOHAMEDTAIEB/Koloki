# Deployment Guide

## Quick Start Deployment Options

### Option 1: Vercel (Full Stack - Recommended)

Easiest for deploying both frontend and API.

**Steps:**
1. Push code to GitHub
2. Visit https://vercel.com/import
3. Select your `coloki` repository
4. Configure project:
   - Framework: Other
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variables:
   ```
   BACKEND_API_URL=https://your-api.vercel.app
   VITE_API_URL=https://your-api.vercel.app
   ```
6. Click Deploy

**Backend Deployment:**
1. Create `vercel.json` in backend root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ]
   }
   ```
2. Deploy backend separately or use monorepo setup

### Option 2: Railway App (Backend + Database)

Perfect for backend API and MongoDB.

**Steps:**
1. Visit https://railway.app
2. Create new project
3. Connect GitHub repository
4. Deploy app:
   - Auto-detects Node.js
   - Add MongoDB plugin
   - Set environment variables
   - Railway handles deployment
5. Get API URL from deployed service

**MongoDB Setup:**
1. In Railway dashboard
2. Add plugin → MongoDB
3. Credentials auto-populated in env vars
4. Ready to use

### Option 3: Self-Hosted (VPS)

For complete control and higher performance.

**Requirements:**
- VPS (DigitalOcean, Linode, AWS EC2)
- Node.js 18+
- MongoDB
- Nginx (reverse proxy)
- SSL certificate

**Setup Steps:**

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
apt install -y mongodb

# Start MongoDB
systemctl start mongodb
systemctl enable mongodb

# Clone repository
git clone https://github.com/yourusername/coloki.git
cd coloki

# Install backend dependencies
cd backend
npm install

# Build backend
npm run build

# Create systemd service
sudo nano /etc/systemd/system/coloki-api.service
```

**systemd service file:**
```ini
[Unit]
Description=Coloki API Server
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/home/nodejs/coloki/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

# Environment variables
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="MONGODB_URI=mongodb://localhost:27017/coloki"
Environment="JWT_SECRET=your-secret-key"
```

**Enable and start:**
```bash
systemctl daemon-reload
systemctl enable coloki-api
systemctl start coloki-api
```

### Option 4: Docker + Kubernetes

For scalable, containerized deployment.

**Create `Dockerfile` (backend):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: coloki-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: coloki
      MONGO_INITDB_ROOT_PASSWORD: secure_password

  api:
    build: ./backend
    container_name: coloki-api
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://coloki:secure_password@mongodb:27017/coloki
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - mongodb

  frontend:
    build: .
    container_name: coloki-frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://api:5000

volumes:
  mongo_data:
```

**Deploy:**
```bash
docker-compose up -d
```

## Environment Configuration

Create `.env` file with:

```env
# Production
NODE_ENV=production
PORT=5000
API_URL=https://api.coloki.app

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coloki

# Security
JWT_SECRET=use-long-random-string-here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=another-random-string
REFRESH_TOKEN_EXPIRY=30d

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
AWS_S3_BUCKET=coloki-uploads

# CORS
CORS_ORIGIN=https://coloki.app
FRONTEND_URL=https://coloki.app
```

## SSL/TLS Certificate

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --standalone -d coloki.app -d api.coloki.app

# Auto-renewal
certbot renew --dry-run
```

## Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name api.coloki.app;
    
    ssl_certificate /etc/letsencrypt/live/api.coloki.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.coloki.app/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}

server {
    listen 80;
    server_name api.coloki.app;
    redirect 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

```bash
# View logs
journalctl -u coloki-api -f

# Monitor processes
pm2 start ecosystem.config.js
pm2 logs
pm2 monit
```

## Database Backups

```bash
# Manual backup
mongodump --uri "mongodb://user:pass@localhost:27017/coloki" \
          --out /backup/coloki-$(date +%Y%m%d)

# Automated daily backup
# Add to crontab:
# 0 2 * * * mongodump --uri "mongodb://..." --out /backup/coloki-$(date +\%Y\%m\%d)
```

## Health Checks

```bash
# Check API health
curl https://api.coloki.app/health

# Response should be:
# {"status":"OK","timestamp":"2026-03-30T..."}
```

## Post-Deployment Checklist

- [ ] API responding on correct URL
- [ ] Database connected and accessible
- [ ] Payments test transaction successful
- [ ] Email notifications sending
- [ ] File uploads working (AWS S3)
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] Logging configured
- [ ] Backup system active
- [ ] Monitoring alerts set up
- [ ] Team notified of new URL

## Troubleshooting

**MongoDB Connection Error:**
```bash
# Check MongoDB status
systemctl status mongodb

# Check connection string
mongo "mongodb://localhost:27017/coloki"
```

**API Not Responding:**
```bash
# Check if service is running
systemctl status coloki-api

# View recent logs
journalctl -u coloki-api -n 50
```

**High CPU Usage:**
- Check for memory leaks
- Review slow database queries
- Optimize API endpoints
- Increase server resources

---

Choose the deployment option that best fits your needs and infrastructure! 🚀
