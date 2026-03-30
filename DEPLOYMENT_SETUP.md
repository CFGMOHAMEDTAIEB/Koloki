# Koloki.tn Deployment Guide

## Summary
Your Koloki website is now deployed to GitHub Pages and ready for domain configuration.

---

## 🎯 FRONTEND DEPLOYMENT STATUS

✅ **Deployed: GitHub Pages**
- Repository: [github.com/CFGMOHAMEDTAIEB/Koloki](https://github.com/CFGMOHAMEDTAIEB/Koloki)
- Build: Production optimized with Vite
- CI/CD: Automated GitHub Actions workflow configured
- Deployment URL: Will appear once domain is configured

### What was done:
1. ✅ Built frontend with `npm run build` 
2. ✅ Created `.github/workflows/deploy.yml` - Automated deployment workflow
3. ✅ Created `CNAME` file with `Coloki.tn` domain
4. ✅ Pushed changes to GitHub

---

## 🌍 CONFIGURE YOUR DOMAIN (Coloki.tn)

Follow these steps to point your domain to GitHub Pages:

### Step 1: Verify Domain in GitHub
1. Go to [github.com/settings/pages](https://github.com/settings/pages)
2. Go to repository Settings → Pages
3. Under "Build and deployment", ensure:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

### Step 2: Configure DNS Records
Contact your domain registrar (check your domain email/account):

**Add these DNS records:**
```
Type: A
Name: @ (or blank)
Value: 185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153

Type: AAAA
Name: @ (or blank)
Value: 2606:50c0:8000::153
     2606:50c0:8001::153
     2606:50c0:8002::153
     2606:50c0:8003::153

Type: CNAME
Name: www
Value: CFGMOHAMEDTAIEB.github.io
```

### Step 3: Wait for DNS Propagation
- DNS can take 24-48 hours to fully propagate
- Check status: [mxtoolbox.com/dnspropagate](https://mxtoolbox.com/dnspropagate)

### Step 4: Enable HTTPS
- GitHub Pages auto-enables HTTPS after DNS propagation
- Visit: `https://coloki.tn` once domain is live

---

## 🚀 BACKEND DEPLOYMENT (Node.js API)

For your Node.js backend (`/backend` folder), you need a separate deployment:

### Option A: Heroku (Easiest, Free tier available)
```bash
# Installation
npm install -g heroku
heroku login
cd backend
heroku create coloki-backend
heroku config:set NODE_ENV=production
git push heroku main
```

### Option B: Railway.app (Recommended, Simple & Modern)
1. Push backend to GitHub
2. Go to [railway.app](https://railway.app)
3. Connect GitHub repository
4. Deploy `/backend` folder

### Option C: AWS/Digital Ocean (Scalable but complex)
- Requires more setup
- Better for production scale

**Set backend API URL in frontend:**
Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'https://coloki-backend.herokuapp.com/api'
```

---

## 🔗 DATABASE & ENV VARIABLES

### Create `.env` in `/backend`:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key
```

**Database Options:**
- MongoDB Atlas (MongoDB Cloud - free tier)
- PostgreSQL on AWS RDS
- Firebase Firestore

---

## ✅ VERIFICATION CHECKLIST

- [ ] GitHub Pages workflow runs successfully
- [ ] Domain DNS records configured
- [ ] Domain redirects to coloki.tn
- [ ] HTTPS certificate issued
- [ ] Backend deployed and API accessible
- [ ] Frontend environment variables updated
- [ ] All API routes returning correctly

---

## 📊 AUTOMATED DEPLOYMENT PROCESS

Your GitHub Actions workflow:
1. **Triggered on:** Push to main branch
2. **Runs:** Build and Deploy jobs
3. **Output:** Automatic deployment to GitHub Pages
4. **No manual intervention needed**

### Check deployment status:
1. Go to: `https://github.com/CFGMOHAMEDTAIEB/Koloki/actions`
2. View workflow runs
3. Check for ✅ or ❌ status

---

## 🐛 DEBUGGING

### Common Issues

**Issue:** Domain not connecting
- Wait 24-48 hours for DNS propagation
- Check DNS records in GitHub Settings → Pages
- Use `nslookup coloki.tn` to verify

**Issue:** GitHub Actions workflow fails
- Check repository Settings → Actions
- View logs in Actions tab
- Ensure dist/ folder is built

**Issue:** CORS errors from backend
- Configure CORS in backend: `cors({ origin: 'https://coloki.tn' })`
- Set proper API URL in environment variables

---

## 📞 NEXT STEPS

1. **Configure Domain DNS** (24-48 hours to propagate)
2. **Deploy Backend** using Railway or Heroku
3. **Set Environment Variables** in frontend
4. **Test All Features** across different devices
5. **Monitor GitHub Actions** for deployment status

---

## 🔗 USEFUL LINKS

- [GitHub Pages Settings](https://github.com/CFGMOHAMEDTAIEB/Koloki/settings/pages)
- [GitHub Actions Workflow](https://github.com/CFGMOHAMEDTAIEB/Koloki/actions)
- [Railway Deployment](https://railway.app)
- [Heroku Dashboard](https://dashboard.heroku.com)
- [Check DNS Propagation](https://mxtoolbox.com/dnspropagate)

---

**Your deployment is ready! Configure your domain and you're live! 🎉**
