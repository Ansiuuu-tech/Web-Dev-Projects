require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET','POST'], credentials: true }
});
app.set('io', io);

// ── Security & Middleware ──────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate Limiting ─────────────────────────
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 200, message: { success:false, message:'Too many requests' } }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 20 }));

// ── API Routes ────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/donations',  require('./routes/donations'));
app.use('/api/payments',   require('./routes/payments'));
app.use('/api/ngos',       require('./routes/ngos'));
app.use('/api/tracking',   require('./routes/tracking'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/analytics',  require('./routes/analytics'));
app.use('/api/vehicles',   require('./routes/vehicles'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health Check ─────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'OK', version: '1.0.0',
  env: process.env.NODE_ENV,
  time: new Date().toISOString()
}));

// ── Serve Frontend (production) ───────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// ── Global Error Handler ─────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Socket.IO ────────────────────────────
require('./services/socketService')(io);

// ── Start ────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 DonateEase running → http://localhost:${PORT}`);
      console.log(`   Mode: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

module.exports = { app, io };
