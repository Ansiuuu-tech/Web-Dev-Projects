const { protect, restrictTo } = require('../middleware/auth');
const { NGO, User, Donation, IssueReport, Notification, Vehicle } = require('../models');

// ── NGOs ─────────────────────────────────────────────────
const ngoRouter = require('express').Router();
ngoRouter.get('/', async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { isActive:true, isVerified:true };
    if (category) filter.acceptingCategories = category;
    if (city) filter['address.city'] = new RegExp(city, 'i');
    const ngos = await NGO.find(filter).sort({ rating:-1 }).limit(20);
    res.json({ success:true, data:{ ngos } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
ngoRouter.get('/:id', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:{ ngo } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
ngoRouter.post('/', protect, restrictTo('admin'), async (req, res) => {
  try { const ngo = await NGO.create(req.body); res.status(201).json({ success:true, data:{ ngo } }); }
  catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
module.exports.ngoRouter = ngoRouter;

// ── Users ─────────────────────────────────────────────────
const userRouter = require('express').Router();
userRouter.use(protect);
userRouter.get('/profile', (req, res) => res.json({ success:true, data:{ user:req.user } }));
userRouter.patch('/profile', async (req, res) => {
  try {
    const allowed = ['name','avatar','address','notifications'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new:true, runValidators:true });
    res.json({ success:true, data:{ user } });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
userRouter.get('/impact', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats name');
    res.json({ success:true, data:{ stats:user.stats } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
userRouter.get('/', protect, restrictTo('admin','ngo_staff'), async (req, res) => {
  try {
    const users = await User.find({ role:'donor' }).sort({ createdAt:-1 }).limit(50);
    res.json({ success:true, data:{ users } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
module.exports.userRouter = userRouter;

// ── Tracking ──────────────────────────────────────────────
const trackingRouter = require('express').Router();
trackingRouter.get('/:trackingId', async (req, res) => {
  try {
    const donation = await Donation.findOne({ trackingId: req.params.trackingId })
      .select('status trackingLog item pickup eta trackingId createdAt')
      .populate('volunteer','name phone');
    if (!donation) return res.status(404).json({ success:false, message:'Tracking ID not found' });
    res.json({ success:true, data:{ donation } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
module.exports.trackingRouter = trackingRouter;

// ── Reports ───────────────────────────────────────────────
const reportRouter = require('express').Router();
reportRouter.use(protect);
reportRouter.post('/', async (req, res) => {
  try {
    const { category, description, donationId, photos, contactViaPhone } = req.body;
    const report = await IssueReport.create({ reporter:req.user._id, donation:donationId||null, category, description, photos, contactViaPhone });
    res.status(201).json({ success:true, data:{ report } });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
reportRouter.get('/', async (req, res) => {
  try {
    const reports = await IssueReport.find({ reporter:req.user._id }).sort({ createdAt:-1 });
    res.json({ success:true, data:{ reports } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
module.exports.reportRouter = reportRouter;

// ── Analytics ─────────────────────────────────────────────
const analyticsRouter = require('express').Router();
analyticsRouter.use(protect, restrictTo('ngo_staff','admin'));
const ac = require('../controllers/analyticsController');
analyticsRouter.get('/dashboard', ac.dashboard);
analyticsRouter.get('/impact', ac.impact);
module.exports.analyticsRouter = analyticsRouter;

// ── Vehicles ──────────────────────────────────────────────
const vehicleRouter = require('express').Router();
vehicleRouter.use(protect, restrictTo('ngo_staff','admin'));
vehicleRouter.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driver','name phone');
    res.json({ success:true, data:{ vehicles } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
vehicleRouter.patch('/:id/location', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { location:req.body.location }, { new:true });
    res.json({ success:true, data:{ vehicle } });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
module.exports.vehicleRouter = vehicleRouter;

// ── Notifications ─────────────────────────────────────────
const notifRouter = require('express').Router();
notifRouter.use(protect);
notifRouter.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient:req.user._id }).sort({ createdAt:-1 }).limit(50);
    const unread = await Notification.countDocuments({ recipient:req.user._id, isRead:false });
    res.json({ success:true, data:{ notifications, unread } });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});
notifRouter.patch('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead:true });
    res.json({ success:true });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
notifRouter.patch('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ recipient:req.user._id, isRead:false }, { isRead:true });
    res.json({ success:true });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
});
module.exports.notifRouter = notifRouter;
