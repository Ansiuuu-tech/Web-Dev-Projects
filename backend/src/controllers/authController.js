const jwt  = require('jsonwebtoken');
const { User, Notification } = require('../models');

const sign = (id) => ({
  access:  jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }),
  refresh: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' })
});

const respond = (user, code, res) => {
  const tokens = sign(user._id);
  user.password = undefined; user.otp = undefined;
  res.status(code).json({ success:true, data:{ user, tokens } });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success:false, message:'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success:false, message:'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'donor', authProvider:'email' });

    // Welcome notification
    await Notification.create({
      recipient: user._id, type:'general',
      title: 'Welcome to DonateEase! 🌱',
      message: `Hi ${name}, your account is ready. Start your first donation today!`
    });

    respond(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success:false, message:'Invalid credentials' });

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
    respond(user, 200, res);
  } catch (err) { next(err); }
};

// POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success:false, message:'Phone required' });
    const normalised = phone.startsWith('+') ? phone : `+91${phone}`;

    let user = await User.findOne({ phone: normalised });
    if (!user) user = new User({ phone: normalised, name: 'User', authProvider:'phone' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10*60*1000), attempts: 0 };
    await user.save({ validateBeforeSave: false });

    // Try Twilio if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.NODE_ENV === 'production') {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilio.messages.create({ body: `DonateEase OTP: ${otp}. Valid 10 mins.`, from: process.env.TWILIO_PHONE_NUMBER, to: normalised });
      } catch (e) { console.warn('Twilio error:', e.message); }
    }

    res.json({ success:true, message:'OTP sent',
      ...(process.env.NODE_ENV === 'development' && { _dev_otp: otp })
    });
  } catch (err) { next(err); }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const normalised = phone.startsWith('+') ? phone : `+91${phone}`;
    const user = await User.findOne({ phone: normalised });

    if (!user?.otp?.code) return res.status(400).json({ success:false, message:'Request a new OTP' });
    if (user.otp.attempts >= 5) return res.status(429).json({ success:false, message:'Too many attempts' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ success:false, message:'OTP expired' });
    if (user.otp.code !== otp) {
      user.otp.attempts++;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success:false, message:'Invalid OTP' });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;
    await user.save({ validateBeforeSave: false });
    respond(user, 200, res);
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success:false, message:'User not found' });
    const { access } = sign(user._id);
    res.json({ success:true, data:{ accessToken: access } });
  } catch {
    res.status(401).json({ success:false, message:'Invalid refresh token' });
  }
};

// GET /api/auth/me
exports.getMe = (req, res) => res.json({ success:true, data:{ user: req.user } });
