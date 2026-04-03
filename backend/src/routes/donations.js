// ── Donations ──────────────────────────────────────────────
const donationRouter = require('express').Router();
const dc = require('../controllers/donationController');
const { protect, restrictTo } = require('../middleware/auth');

donationRouter.get('/community/impact', dc.communityImpact);
donationRouter.use(protect);
donationRouter.post('/', dc.create);
donationRouter.get('/', dc.getMyDonations);
donationRouter.get('/all', restrictTo('ngo_staff','admin'), dc.getAll);
donationRouter.get('/:id', dc.getOne);
donationRouter.patch('/:id/reschedule', dc.reschedule);
donationRouter.patch('/:id/cancel', dc.cancel);
donationRouter.patch('/:id/status', restrictTo('volunteer','ngo_staff','admin'), dc.updateStatus);
module.exports = donationRouter;
