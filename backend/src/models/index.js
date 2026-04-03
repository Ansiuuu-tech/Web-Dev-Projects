// ─── User Model ───────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:    { type: String, required: [true,'Name required'], trim: true },
  phone:   { type: String, unique: true, sparse: true, trim: true },
  email:   { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password:{ type: String, minlength: 6, select: false },
  avatar:  { type: String, default: '' },
  role:    { type: String, enum: ['donor','volunteer','ngo_staff','admin'], default: 'donor' },
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  authProvider: { type: String, enum: ['phone','email','google'], default: 'email' },
  otp: { code: String, expiresAt: Date, attempts: { type: Number, default: 0 } },
  address: { line1: String, city: String, state: String, pin: String, lat: Number, lng: Number },
  stats: {
    itemsDonated:   { type: Number, default: 0 },
    familiesHelped: { type: Number, default: 0 },
    totalDonated:   { type: Number, default: 0 },
    impactLevel:    { type: String, enum: ['Bronze','Silver','Gold','Platinum'], default: 'Bronze' }
  },
  ngoId:         { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  notifications: { type: Boolean, default: true },
  lastSeen:      { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(c) { return bcrypt.compare(c, this.password); };
userSchema.methods.updateImpactLevel = function() {
  const { itemsDonated, totalDonated } = this.stats;
  if (itemsDonated >= 100 || totalDonated >= 10000) this.stats.impactLevel = 'Platinum';
  else if (itemsDonated >= 50 || totalDonated >= 5000) this.stats.impactLevel = 'Gold';
  else if (itemsDonated >= 10 || totalDonated >= 1000) this.stats.impactLevel = 'Silver';
  else this.stats.impactLevel = 'Bronze';
};
const User = mongoose.model('User', userSchema);

// ─── NGO Model ────────────────────────────────────────────
const ngoSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: String,
  logo:        { type: String, default: '' },
  isVerified:  { type: Boolean, default: false },
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  totalRatings:{ type: Number, default: 0 },
  contact: { email: String, phone: String, website: String },
  address: { line1: String, city: String, state: String, pin: String, lat: Number, lng: Number },
  acceptingCategories: [{ type: String, enum: ['Clothes','Books','Electronics','Toys','Furniture','Kitchenware','Bedding','Appliances','Other'] }],
  stats: { itemsReceived: { type: Number, default: 0 }, donorsCount: { type: Number, default: 0 }, totalFundsRaised: { type: Number, default: 0 } },
  isActive: { type: Boolean, default: true },
  zone: String
}, { timestamps: true });
const NGO = mongoose.model('NGO', ngoSchema);

// ─── Donation Model ───────────────────────────────────────
const trackingEventSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location:  { lat: Number, lng: Number },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const donationSchema = new mongoose.Schema({
  donor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngo:       { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: {
    category:    { type: String, enum: ['Clothes','Books','Electronics','Toys','Furniture','Kitchenware','Bedding','Appliances','Other'], required: true },
    description: { type: String, required: true, maxlength: 500 },
    quantity:    { type: Number, required: true, min: 1 },
    condition:   { type: String, enum: ['Like New','Good','Gently Used'], required: true },
    photos:      [String]
  },
  pickup: {
    address: { line1: String, city: String, state: String, pin: String, lat: Number, lng: Number },
    scheduledDate: Date,
    timeSlot:  String,
    preferredDay: String,
    zone: String,
    supportType:   { type: String, enum: ['ad','contribution','none'], default: 'none' },
    supportAmount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Requested','Scheduled','Collected','InTransit','Delivered','Cancelled'],
    default: 'Requested'
  },
  trackingId:  { type: String, unique: true },
  trackingLog: [trackingEventSchema],
  eta:         Number,
  notes:       String,
  isImpactShared: { type: Boolean, default: false }
}, { timestamps: true });

donationSchema.pre('save', function(next) {
  if (!this.trackingId) this.trackingId = 'DE-' + Math.floor(10000000 + Math.random() * 90000000);
  next();
});
donationSchema.methods.addTrackingEvent = function(status, message, updatedBy, location) {
  this.status = status;
  this.trackingLog.push({ status, message, updatedBy, location });
};
const Donation = mongoose.model('Donation', donationSchema);

// ─── Payment Model ────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:   { type: String, enum: ['platform_support','pickup_support','ngo_donation'], required: true },
  amount: { type: Number, required: true },
  razorpay: { orderId: { type: String, unique: true, sparse: true }, paymentId: String, signature: String },
  method: String,
  status: { type: String, enum: ['created','paid','failed','refunded'], default: 'created' },
  receipt: String,
  message: String,
  relatedEntity: mongoose.Schema.Types.ObjectId
}, { timestamps: true });
paymentSchema.pre('save', function(next) {
  if (!this.receipt) this.receipt = 'DE-' + Math.floor(10000000 + Math.random() * 90000000);
  next();
});
const Payment = mongoose.model('Payment', paymentSchema);

// ─── Vehicle Model ────────────────────────────────────────
const vehicleSchema = new mongoose.Schema({
  vehicleId:  { type: String, required: true, unique: true },
  driver:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: String,
  capacity:   { type: Number, default: 20 },
  loaded:     { type: Number, default: 0 },
  zone:       String,
  status:     { type: String, enum: ['active','idle','maintenance'], default: 'idle' },
  location:   { lat: Number, lng: Number },
  schedule:   [{
    date: Date,
    timeStart: String,
    timeEnd: String,
    zoneName: String,
    stops: Number
  }]
}, { timestamps: true });
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// ─── IssueReport Model ────────────────────────────────────
const issueReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  category: { type: String, enum: ['Pickup Issue','App Bug','Payment Issue','Volunteer Issue','Other'], required: true },
  description: { type: String, required: true, maxlength: 500 },
  photos:  [String],
  contactViaPhone: { type: Boolean, default: false },
  ticketId: { type: String, unique: true },
  status:   { type: String, enum: ['Open','InProgress','Resolved','Closed'], default: 'Open' },
  response: String,
  resolvedAt: Date
}, { timestamps: true });
issueReportSchema.pre('save', function(next) {
  if (!this.ticketId) this.ticketId = '#DE-' + Math.floor(10000 + Math.random() * 90000);
  next();
});
const IssueReport = mongoose.model('IssueReport', issueReportSchema);

// ─── Notification Model ───────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['system','pickup','marketplace','payment','general'], default: 'general' },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  isUrgent: { type: Boolean, default: false },
  link:     String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { User, NGO, Donation, Payment, Vehicle, IssueReport, Notification };
