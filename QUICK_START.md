# 🚀 Coloki Quick Start Guide

Get Coloki running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git installed
- A code editor (VS Code recommended)

## Quick Setup

### 1. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# (Optional) Edit .env with your configuration
# - Keep defaults for local development
# - Update for production

# Start development server
npm run dev

# Backend will run on http://localhost:5000
```

### 2. Frontend Setup (Terminal 2)

```bash
# From project root (Colocation Houses Mobile App)

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

### 3. Open in Browser

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Key Endpoints to Test

### 1. Health Check
```bash
curl http://localhost:5000/health
# Response: {"status":"OK","timestamp":"..."}
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+216123456789",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "renter"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. List Properties
```bash
curl http://localhost:5000/api/properties
```

## Configuration for Development

### Backend `.env` Defaults

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coloki
JWT_SECRET=dev-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_fake
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
```bash
# Make sure MongoDB is running
# Option 1: Local MongoDB
mongod

# Option 2: MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Issue: "Port 5000 already in use"
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Issue: "CORS error"
```bash
# Make sure CORS_ORIGIN matches your frontend URL
# In backend/.env:
CORS_ORIGIN=http://localhost:5173
```

### Issue: "Module not found"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing Features

### 1. Create Listing (Owner Feature)
```javascript
// Need to be logged in as owner
POST /api/properties
{
  "title": "Beautiful 2-bedroom apartment in Tunis",
  "description": "Spacious colocation near metro station...",
  "location": {
    "address": "Rue de la Paix, Tunis",
    "city": "Tunis",
    "latitude": 36.7994,
    "longitude": 10.1758
  },
  "roomTypes": [
    {
      "type": "single",
      "price": 400,
      "available": 2
    }
  ],
  "amenities": ["WiFi", "Kitchen", "Laundry"],
  "rules": ["No smoking", "Quiet after 10pm"]
}
```

### 2. Create Payment Intent
```javascript
// After listing created
POST /api/payments/listing-fee
{
  "propertyId": "property-id",
  "amount": 10
}
```

## Development Workflow

1. **Develop Backend**
   - Edit files in `/backend/src/`
   - Changes auto-reload with nodemon
   - Test with curl or Postman

2. **Develop Frontend**
   - Edit files in `/src/app/`
   - Changes auto-refresh in browser
   - Use React DevTools for debugging

3. **Add New Endpoint**
   ```
   1. Create route in backend/src/routes/
   2. Add service/controller logic
   3. Update API client in src/services/api.ts
   4. Create component in src/app/components/
   5. Test endpoint
   ```

## Tools Recommended

- **Postman**: API testing (https://postman.com)
- **MongoDB Compass**: Database GUI (https://www.mongodb.com/products/compass)
- **VS Code**: Code editor (https://code.visualstudio.com)
- **React Developer Tools**: Browser extension

## Build for Production

### Frontend
```bash
npm run build
# Creates optimized build in dist/
```

### Backend
```bash
cd backend
npm run build
# Creates compiled JS in dist/
npm start
# Runs production build
```

## Deploy

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Vercel deployment
- Railway deployment
- Self-hosted options
- Docker deployment

## Debugging

### Backend Debug Mode
```bash
# Add debugging
NODE_DEBUG=* npm run dev

# Or use built-in Node inspector
node --inspect-brk dist/index.js
# Then open chrome://inspect
```

### Frontend Debug Mode
```bash
# Development already has source maps
# Open browser DevTools (F12) for debugging
```

## Database Seeding (Optional)

Create sample data:
```javascript
// In backend/src/scripts/seed.ts
import { User } from '../models/User';

async function seedDatabase() {
  await User.create({
    email: 'owner@coloki.com',
    phone: '+216123456789',
    passwordHash: 'password123',
    firstName: 'Owner',
    lastName: 'Test',
    userType: 'owner',
    verificationStatus: 'verified'
  });
}
```

## Next Steps

1. ✅ familiarize yourself with the codebase
2. ✅ Test all API endpoints
3. ✅ Create a test user account
4. ✅ Create a test property listing
5. ✅ Test payment flow
6. ✅ Review security features
7. ✅ Read the policies documentation
8. Deploy to production

## Documentation Quick Links

- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Full project overview
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment guide
- [docs/GITHUB_SETUP.md](./docs/GITHUB_SETUP.md) - GitHub setup
- [docs/HELP.md](./docs/HELP.md) - User help center
- [docs/legal/TERMS_AND_CONDITIONS.md](./docs/legal/TERMS_AND_CONDITIONS.md) - Terms
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide

## Support

- **Email**: support@coloki.com
- **Issues**: Open GitHub issues
- **Discussions**: GitHub discussions

## Architecture Overview

```
Coloki Platform
├── Frontend (React)
│   ├── Mobile app interface
│   ├── User authentication
│   ├── Property browsing
│   └── Payment integration
├── Backend (Express + Node.js)
│   ├── User management
│   ├── Property listings
│   ├── Payment processing
│   ├── Verification system
│   └── Advertising module
├── Database (MongoDB)
│   ├── Users
│   ├── Properties
│   ├── Transactions
│   └── Ads
└── Website (Static HTML)
    └── Marketing landing page
```

---

**You're all set! Happy coding! 🎉**
