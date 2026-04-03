const crypto   = require('crypto');
const { Payment, User, Donation, Notification } = require('../models');

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

// POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, type, donationId, message } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ success:false, message:'Invalid amount' });

    let order;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_xxxxxxxxxxxxxxxx') {
      order = await getRazorpay().orders.create({ amount: Math.round(amount*100), currency:'INR', receipt:`DE-${Date.now()}`, notes:{ userId: req.user._id.toString(), type } });
    } else {
      // Dev mock
      order = { id:`order_mock_${Date.now()}`, amount: amount*100, currency:'INR' };
    }

    const payment = await Payment.create({ user: req.user._id, type, amount, message, relatedEntity: donationId||null, razorpay:{ orderId: order.id }, status:'created' });

    res.json({ success:true, data:{
      orderId: order.id, amount: order.amount, currency: order.currency, paymentDbId: payment._id,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      prefill: { name: req.user.name||'', email: req.user.email||'', contact: req.user.phone||'' }
    }});
  } catch (err) { next(err); }
};

// POST /api/payments/verify
exports.verify = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, paymentDbId } = req.body;
    let isValid = false;

    if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'xxxxxxxxxxxxxxxxxxxxxxxx') {
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
      isValid = expected === signature;
    } else {
      isValid = true; // dev mode
    }

    if (!isValid) return res.status(400).json({ success:false, message:'Signature mismatch' });

    const payment = await Payment.findByIdAndUpdate(paymentDbId, { 'razorpay.paymentId': paymentId, 'razorpay.signature': signature, status:'paid' }, { new:true });
    if (!payment) return res.status(404).json({ success:false, message:'Payment record not found' });

    await User.findByIdAndUpdate(req.user._id, { $inc:{ 'stats.totalDonated': payment.amount } });

    if (payment.type === 'pickup_support' && payment.relatedEntity)
      await Donation.findByIdAndUpdate(payment.relatedEntity, { 'pickup.supportType':'contribution', 'pickup.supportAmount': payment.amount });

    await Notification.create({ recipient: req.user._id, type:'payment', title:'Payment Successful ✅', message:`₹${payment.amount} payment confirmed. Receipt: ${payment.receipt}` });

    res.json({ success:true, data:{ receipt: payment.receipt, amount: payment.amount, method: 'UPI', transactionId: payment.receipt } });
  } catch (err) { next(err); }
};

// GET /api/payments/history
exports.history = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id, status:'paid' }).sort({ createdAt:-1 }).limit(20);
    res.json({ success:true, data:{ payments } });
  } catch (err) { next(err); }
};

// POST /api/payments/webhook (Razorpay → server)
exports.webhook = async (req, res, next) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
      if (expected !== sig) return res.status(400).json({ message:'Invalid signature' });
    }
    const { event, payload } = req.body;
    const orderId = payload?.payment?.entity?.order_id;
    if (event === 'payment.captured') await Payment.findOneAndUpdate({ 'razorpay.orderId': orderId }, { status:'paid', 'razorpay.paymentId': payload.payment.entity.id });
    if (event === 'payment.failed') await Payment.findOneAndUpdate({ 'razorpay.orderId': orderId }, { status:'failed' });
    res.json({ received:true });
  } catch (err) { next(err); }
};
