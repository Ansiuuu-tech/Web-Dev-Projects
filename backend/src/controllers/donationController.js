const { Donation, User, NGO, Notification } = require('../models');

// POST /api/donations
exports.create = async (req, res, next) => {
  try {
    const { item, pickup, ngo } = req.body;
    const donation = await Donation.create({
      donor: req.user._id, ngo: ngo || null, item, pickup,
      trackingLog: [{ status:'Requested', message:'Donation request registered successfully.', updatedBy: req.user._id }]
    });

    // Notify donor
    await Notification.create({
      recipient: req.user._id, type:'pickup',
      title: 'Donation Registered! 📦',
      message: `Your donation (${donation.trackingId}) has been received. We'll schedule a pickup soon.`,
      link: `/track/${donation.trackingId}`
    });

    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('donation:created', { donationId: donation._id, trackingId: donation.trackingId });

    const populated = await donation.populate('ngo', 'name logo isVerified');
    res.status(201).json({ success:true, data:{ donation: populated } });
  } catch (err) { next(err); }
};

// GET /api/donations  (donor's own)
exports.getMyDonations = async (req, res, next) => {
  try {
    const { status, page=1, limit=10 } = req.query;
    const filter = { donor: req.user._id };
    if (status) filter.status = status;

    const [donations, total] = await Promise.all([
      Donation.find(filter).populate('ngo','name logo').populate('volunteer','name phone').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit)),
      Donation.countDocuments(filter)
    ]);
    res.json({ success:true, data:{ donations, total, page: Number(page), pages: Math.ceil(total/limit) } });
  } catch (err) { next(err); }
};

// GET /api/donations/all  (ngo_staff/admin)
exports.getAll = async (req, res, next) => {
  try {
    const { status, zone, category, page=1, limit=20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (zone) filter['pickup.zone'] = zone;
    if (category) filter['item.category'] = category;

    let query = Donation.find(filter).populate('donor','name phone email avatar').populate('ngo','name').populate('volunteer','name').sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit));

    const [donations, total] = await Promise.all([query, Donation.countDocuments(filter)]);
    res.json({ success:true, data:{ donations, total, page: Number(page), pages: Math.ceil(total/limit) } });
  } catch (err) { next(err); }
};

// GET /api/donations/:id
exports.getOne = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor','name phone email avatar address').populate('ngo','name logo address contact isVerified').populate('volunteer','name phone avatar stats');
    if (!donation) return res.status(404).json({ success:false, message:'Not found' });

    const isOwner = donation.donor._id.toString() === req.user._id.toString();
    const isStaff = ['ngo_staff','admin','volunteer'].includes(req.user.role);
    if (!isOwner && !isStaff) return res.status(403).json({ success:false, message:'Access denied' });

    res.json({ success:true, data:{ donation } });
  } catch (err) { next(err); }
};

// PATCH /api/donations/:id/reschedule
exports.reschedule = async (req, res, next) => {
  try {
    const { scheduledDate, timeSlot } = req.body;
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
    if (!donation) return res.status(404).json({ success:false, message:'Not found' });
    if (!['Requested','Scheduled'].includes(donation.status))
      return res.status(400).json({ success:false, message:'Cannot reschedule at this stage' });

    donation.pickup.scheduledDate = new Date(scheduledDate);
    donation.pickup.timeSlot = timeSlot;
    donation.addTrackingEvent('Scheduled', `Rescheduled to ${new Date(scheduledDate).toDateString()} at ${timeSlot}.`, req.user._id);
    await donation.save();

    req.app.get('io').to(`user_${req.user._id}`).emit('donation:updated', { donationId: donation._id, status: donation.status });
    res.json({ success:true, data:{ donation } });
  } catch (err) { next(err); }
};

// PATCH /api/donations/:id/status  (volunteer/admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, message, location, eta } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success:false, message:'Not found' });

    donation.addTrackingEvent(status, message, req.user._id, location);
    if (eta !== undefined) donation.eta = eta;
    await donation.save();

    if (status === 'Delivered') {
      await User.findByIdAndUpdate(donation.donor, { $inc: { 'stats.itemsDonated': donation.item.quantity, 'stats.familiesHelped': 1 } });
      await Notification.create({ recipient: donation.donor, type:'pickup', title:'Donation Delivered! 🎉', message:`Your donation (${donation.trackingId}) has been successfully delivered to the NGO.`, isUrgent:false });
    }

    const io = req.app.get('io');
    io.to(`user_${donation.donor}`).emit('donation:tracking', { donationId:donation._id, trackingId:donation.trackingId, status, message, location, eta, timestamp: new Date() });
    io.to(`donation_${donation._id}`).emit('donation:tracking', { status, message, location, eta, timestamp: new Date() });

    res.json({ success:true, data:{ donation } });
  } catch (err) { next(err); }
};

// PATCH /api/donations/:id/cancel
exports.cancel = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
    if (!donation) return res.status(404).json({ success:false, message:'Not found' });
    if (['Delivered','Cancelled'].includes(donation.status))
      return res.status(400).json({ success:false, message:'Cannot cancel' });

    donation.addTrackingEvent('Cancelled', 'Cancelled by donor.', req.user._id);
    await donation.save();
    res.json({ success:true, message:'Donation cancelled' });
  } catch (err) { next(err); }
};

// GET /api/donations/community/impact
exports.communityImpact = async (req, res, next) => {
  try {
    const [items, donors, ngos] = await Promise.all([
      Donation.aggregate([{ $match:{ status:'Delivered' } }, { $group:{ _id:null, total:{ $sum:'$item.quantity' } } }]),
      User.countDocuments({ 'stats.familiesHelped':{ $gt:0 } }),
      require('../models').NGO.countDocuments({ isVerified:true, isActive:true })
    ]);
    res.json({ success:true, data:{ itemsShared: items[0]?.total || 0, familiesHelped: donors, ngoPartners: ngos } });
  } catch (err) { next(err); }
};
