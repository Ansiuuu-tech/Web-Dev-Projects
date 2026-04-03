// routes/auth.js
const authRouter = require('express').Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');
authRouter.post('/register',    auth.register);
authRouter.post('/login',       auth.login);
authRouter.post('/send-otp',    auth.sendOTP);
authRouter.post('/verify-otp',  auth.verifyOTP);
authRouter.post('/refresh',     auth.refresh);
authRouter.get ('/me', protect, auth.getMe);
module.exports = authRouter;
