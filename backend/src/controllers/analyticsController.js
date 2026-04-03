const { Donation, User, NGO, Payment } = require('../models');

// GET /api/analytics/dashboard
exports.dashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalDonations, itemsThisWeek, activeDonors, ngoPartners,
      byStatus, byCategory, recentActivity, monthlyTrend, fleetUtil
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.aggregate([{ $match:{ createdAt:{ $gte: startOfWeek } } }, { $group:{ _id:null, total:{ $sum:'$item.quantity' } } }]),
      User.countDocuments({ role:'donor', isActive:true }),
      NGO.countDocuments({ isVerified:true, isActive:true }),
      Donation.aggregate([{ $group:{ _id:'$status', count:{ $sum:1 } } }]),
      Donation.aggregate([{ $group:{ _id:'$item.category', count:{ $sum:1 } } }, { $sort:{ count:-1 } }]),
      Donation.find().populate('donor','name avatar').sort({ createdAt:-1 }).limit(5),
      Donation.aggregate([
        { $match:{ createdAt:{ $gte: new Date(now.getFullYear(), 0, 1) } } },
        { $group:{ _id:{ $month:'$createdAt' }, received:{ $sum:1 }, redistributed:{ $sum:{ $cond:[{ $eq:['$status','Delivered'] }, 1, 0] } } } },
        { $sort:{ _id:1 } }
      ]),
      require('../models').Vehicle
        ? require('../models').Vehicle.aggregate([{ $group:{ _id:null, avgUtil:{ $avg:{ $multiply:[{ $divide:['$loaded','$capacity'] }, 100] } } } }])
        : Promise.resolve([])
    ]);

    res.json({ success:true, data:{
      stats: {
        totalDonations,
        itemsThisWeek: itemsThisWeek[0]?.total || 0,
        activeDonors,
        ngoPartners
      },
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      byCategory,
      recentActivity,
      monthlyTrend,
      fleetUtilization: Math.round(fleetUtil[0]?.avgUtil || 0)
    }});
  } catch (err) { next(err); }
};

// GET /api/analytics/impact
exports.impact = async (req, res, next) => {
  try {
    const [totalItems, familiesHelped, totalFunds, topDonors] = await Promise.all([
      Donation.aggregate([{ $match:{ status:'Delivered' } }, { $group:{ _id:null, total:{ $sum:'$item.quantity' } } }]),
      User.aggregate([{ $group:{ _id:null, total:{ $sum:'$stats.familiesHelped' } } }]),
      Payment.aggregate([{ $match:{ status:'paid' } }, { $group:{ _id:null, total:{ $sum:'$amount' } } }]),
      User.find({ 'stats.itemsDonated':{ $gt:0 } }).sort({ 'stats.itemsDonated':-1 }).limit(10).select('name avatar stats')
    ]);
    res.json({ success:true, data:{
      totalItems: totalItems[0]?.total || 0,
      familiesHelped: familiesHelped[0]?.total || 0,
      totalFunds: totalFunds[0]?.total || 0,
      topDonors
    }});
  } catch (err) { next(err); }
};
