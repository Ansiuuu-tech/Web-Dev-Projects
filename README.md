# DonateEase — Full Stack Deployment Guide

## Architecture
```
donateease-full/
├── backend/          ← Node.js + Express + MongoDB + Socket.IO
│   ├── src/
│   │   ├── server.js         ← Entry point
│   │   ├── models/index.js   ← All Mongoose models
│   │   ├── controllers/      ← Business logic
│   │   ├── routes/           ← API routes
│   │   ├── middleware/auth.js ← JWT guard
│   │   ├── services/         ← Socket.IO
│   │   └── seed/seed.js      ← Demo data
│   └── package.json
└── frontend/         ← React + Vite
    ├── src/
    │   ├── App.jsx           ← Router
    │   ├── api/index.js      ← Axios + all API calls
    │   ├── context/authStore.js ← Zustand state
    │   ├── components/UI.jsx ← Shared components
    │   └── pages/            ← All 12 pages
    └── package.json
```

---

## 🚀 Local Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Install
```bash
git clone / unzip your project
cd donateease-full
npm run install:all
```

### 3. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env — minimum required:
#   MONGO_URI=mongodb://localhost:27017/donateease
#   JWT_SECRET=any-long-random-string
#   JWT_REFRESH_SECRET=another-long-random-string
```

### 4. Seed database
```bash
npm run seed
# Creates: admin, staff, donors, NGOs, donations, vehicles
```

### 5. Run dev servers
```bash
cd ..
npm run dev
# Backend → http://localhost:5000
# Frontend → http://localhost:5173
```

---

## 🌐 Production Deployment

### Option A: Railway (Recommended — free tier)
```bash
# 1. Push to GitHub
# 2. Connect repo to railway.app
# 3. Add service → Deploy backend
# 4. Set environment variables in Railway dashboard
# 5. Add MongoDB addon or use Atlas

# Build command (set in Railway):
cd backend && npm install

# Start command:
node backend/src/server.js
```

Set these env vars in Railway:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://your-frontend.vercel.app
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Option B: Render
```bash
# Build command: cd backend && npm install
# Start command: node backend/src/server.js
# Same env vars as above
```

### Frontend → Vercel
```bash
cd frontend
# Edit src/api/index.js — change baseURL:
# const api = axios.create({ baseURL: 'https://your-backend.railway.app/api' });

npm run build
# Deploy dist/ folder to Vercel
# Or: vercel --prod
```

### Option C: Self-hosted (VPS/EC2)
```bash
# Install PM2
npm install -g pm2

# Build frontend
cd frontend && npm run build

# Copy dist to backend for serving
cp -r dist ../backend/

# Start with PM2
cd backend
pm2 start src/server.js --name donateease
pm2 save
pm2 startup

# Nginx config
server {
  listen 80;
  server_name yourdomain.com;
  location / { proxy_pass http://localhost:5000; }
  location /socket.io { proxy_pass http://localhost:5000; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }
}
```

---

## API Reference

### Auth
```
POST /api/auth/register   { name, email, password, role }
POST /api/auth/login      { email, password }
POST /api/auth/send-otp   { phone }
POST /api/auth/verify-otp { phone, otp }
POST /api/auth/refresh    { refreshToken }
GET  /api/auth/me         (Bearer token)
```

### Donations
```
POST  /api/donations                    Create donation
GET   /api/donations                    My donations
GET   /api/donations/all               All (admin/staff)
GET   /api/donations/:id               Single donation
PATCH /api/donations/:id/status        Update status (staff)
PATCH /api/donations/:id/reschedule    Reschedule
PATCH /api/donations/:id/cancel        Cancel
GET   /api/donations/community/impact  Public stats
```

### Payments (Razorpay)
```
POST /api/payments/create-order  { amount, type }
POST /api/payments/verify        { orderId, paymentId, signature }
POST /api/payments/webhook       (Razorpay → server)
GET  /api/payments/history       My payments
```

### Other
```
GET  /api/ngos               List NGOs
GET  /api/tracking/:id       Public tracking
GET  /api/analytics/dashboard Admin analytics
GET  /api/vehicles           Fleet list
GET  /api/notifications      My notifications
POST /api/reports            Submit issue report
```

---

## Real-time (Socket.IO)
```js
const socket = io('http://localhost:5000', { auth: { token } });

socket.emit('track:subscribe',  { donationId });
socket.on('donation:tracking',  ({ status, message, eta }) => { ... });
socket.on('donation:location',  ({ lat, lng, eta }) => { ... });

// Volunteer sends location
socket.emit('volunteer:location', { donationId, lat, lng, eta });
```

---

## Optional Integrations

### Razorpay (Payments)
1. Sign up → razorpay.com → Test Keys
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`
3. Set webhook URL: `https://yourdomain.com/api/payments/webhook`

### Twilio (SMS OTP)
1. Sign up → twilio.com → Get phone number
2. Or use Twilio Verify for managed OTP
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### MongoDB Atlas (Cloud DB)
1. cloud.mongodb.com → New Cluster → Free tier
2. Connect → Get connection string
3. Replace `MONGO_URI` in `.env`

### Cloudinary (File Uploads)
1. cloudinary.com → Create account
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
