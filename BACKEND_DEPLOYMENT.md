# Backend Deployment Instructions

## Quick Start

### 1. Set Up Environment Variables

Create `.env` file in the `/backend` directory:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/coloki

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...

# AWS S3 (File uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=coloki-files
AWS_REGION=us-east-1

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# API URLs
FRONTEND_URL=https://coloki.tn
API_URL=https://api.coloki.tn
```

### 2. Choose Deployment Platform

#### Option A: Railway.app (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Select `/backend` folder as root directory
5. Add environment variables in Railway dashboard
6. Deploy!

**Cost:** Free tier covers most use cases, ~$5/month for production

#### Option B: Heroku (Classic but Phased Out)
```bash
npm install -g heroku
cd backend
heroku create coloki-api
heroku config:set NODE_ENV=production
git push heroku main
```

#### Option C: AWS EC2 + RDS
More complex, better for enterprise scale.

### 3. MongoDB Database Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
4. Add IP whitelist (0.0.0.0/0 for development)
5. Set `DATABASE_URL` in environment variables

### 4. Stripe Payment Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from dashboard
3. Test keys in development, live keys in production
4. Webhook endpoint: `https://api.coloki.tn/webhooks/stripe`

### 5. Custom Domain for API

Point API subdomain to your deployed backend:
```
api.coloki.tn → your-backend-url.railway.app
```

DNS Configuration:
```
Type: CNAME
Name: api
Value: your-railway-domain.railway.app
```

### 6. Monitor & Debug

**Railway:**
- View logs: Dashboard → Logs tab
- Monitor performance: Metrics tab
- Restart deployment: Redeploy button

**Check API Health:**
```bash
curl https://api.coloki.tn/health
```

### 7. CI/CD Automation

The `.github/workflows/deploy-backend.yml` workflow will:
- Trigger on push to main branch (backend folder changes)
- Build the backend
- Deploy automatically to Railway

**To enable:**
1. Go to Railway Settings
2. Add GitHub token: `RAILWAY_TOKEN`
3. Save to GitHub Secrets

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | MongoDB connection | mongodb+srv://... |
| `JWT_SECRET` | Token signing | any-long-random-string |
| `STRIPE_SECRET_KEY` | Payment processing | sk_live_... |
| `AWS_S3_BUCKET` | File storage | coloki-files |
| `API_URL` | Backend URL | https://api.coloki.tn |
| `FRONTEND_URL` | Frontend CORS origin | https://coloki.tn |

---

## Cost Analysis

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Railway | Starter | Free | Includes $5/month credit |
| MongoDB Atlas | Free | Free | 512MB storage |
| Stripe | Pay-as-you-go | 2.9% + $0.30 | Per transaction |
| AWS S3 | Pay-as-you-go | ~$0.023 per GB | Storage cost |

---

## Troubleshooting

**Backend not connecting:**
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Ensure environment variables are set
- Check CORS settings in Express

**Database connection fails:**
- Verify MongoDB cluster IP whitelist
- Check connection string format
- Test locally: `mongodb+srv://...`

**Stripe webhook not firing:**
- Verify webhook URL is accessible
- Check Stripe dashboard → Webhooks
- Logs appear in Railway dashboard

---

## Rollback & Recovery

If deployment fails:
1. Railway stores previous versions
2. Click "Redeploy" for previous version
3. Or push new commit to trigger re-deployment

---

## Next Steps After Deployment

- [ ] Set up monitoring/alerts
- [ ] Configure rate limiting
- [ ] Setup email notifications
- [ ] Test payment flow
- [ ] Load testing
- [ ] Set up backups
- [ ] Document API endpoints
