const jwt  = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer '))
      token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success:false, message:'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password -otp');
    if (!user || !user.isActive) return res.status(401).json({ success:false, message:'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ success:false, message:'Token expired' });
    res.status(401).json({ success:false, message:'Invalid token' });
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:'Access denied' });
  next();
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -otp');
    }
  } catch {}
  next();
};
