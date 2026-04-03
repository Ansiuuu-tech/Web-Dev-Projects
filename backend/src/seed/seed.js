require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://donateease:Gaurji%40123@donateease.copnjx5.mongodb.net/donateease?retryWrites=true&w=majority';
const mongoose = require('mongoose');
const { User, NGO, Donation, Vehicle, Notification } = require('../models');

const seed = async () => {
  await mongoose.connect(MONGO_URI);
// const { User, NGO, Donation, Vehicle, Notification } = require('../models');

// const seed = async () => {
//   await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/donateease');
//   console.log('Connected to MongoDB');

  // Clear existing 
  await Promise.all([User.deleteMany(), NGO.deleteMany(), Donation.deleteMany(), Vehicle.deleteMany(), Notification.deleteMany()]);
  console.log('Cleared existing data');

  // ── Create Admin ──────────────────────────────
  const admin = await User.create({ name:'Sarah Jenkins', email:'admin@donateease.org', password:'Admin@123', role:'admin', isEmailVerified:true, address:{ city:'Mumbai', state:'Maharashtra' } });

  // ── Create NGO Staff ──────────────────────────
  const staff = await User.create({ name:'Priya Sharma', email:'staff@donateease.org', password:'Staff@123', role:'ngo_staff', isEmailVerified:true, address:{ city:'Mumbai', state:'Maharashtra' } });

  // ── Create Donors ─────────────────────────────
  const donors = await User.create([
    { name:'Rahul Gupta', email:'rahul@example.com', phone:'+919876543210', password:'Donor@123', role:'donor', isEmailVerified:true, isPhoneVerified:true, address:{ line1:'H-12, Green Park', city:'New Delhi', state:'Delhi', pin:'110016', lat:28.5494, lng:77.1960 }, stats:{ itemsDonated:42, familiesHelped:12, totalDonated:2450, impactLevel:'Silver' } },
    { name:'Ananya Mehta', email:'ananya@example.com', phone:'+919876543211', password:'Donor@123', role:'donor', isEmailVerified:true, address:{ line1:'Flat 402, Green Meadows', city:'Bengaluru', state:'Karnataka', pin:'560038', lat:12.9716, lng:77.5946 }, stats:{ itemsDonated:15, familiesHelped:4, totalDonated:800, impactLevel:'Bronze' } },
    { name:'Vikram Goel', email:'vikram@example.com', phone:'+919876543212', password:'Donor@123', role:'donor', isEmailVerified:true, address:{ line1:'Sector 22, Noida', city:'Noida', state:'UP', pin:'201301', lat:28.5355, lng:77.3910 }, stats:{ itemsDonated:28, familiesHelped:8, totalDonated:1500, impactLevel:'Silver' } },
    { name:'Meera Kapoor', email:'meera@example.com', phone:'+919876543213', password:'Donor@123', role:'donor', isEmailVerified:true, address:{ line1:'Bandra West', city:'Mumbai', state:'Maharashtra', pin:'400050', lat:19.0596, lng:72.8295 }, stats:{ itemsDonated:8, familiesHelped:2, totalDonated:500, impactLevel:'Bronze' } },
    { name:'Arjun Nair', email:'arjun@example.com', phone:'+919876543214', password:'Donor@123', role:'donor', isEmailVerified:true, address:{ line1:'Koramangala', city:'Bengaluru', state:'Karnataka', pin:'560034', lat:12.9352, lng:77.6245 }, stats:{ itemsDonated:65, familiesHelped:20, totalDonated:5800, impactLevel:'Gold' } },
  ]);

  // ── Create Volunteers ─────────────────────────
  const volunteers = await User.create([
    { name:'Ravi Kumar', email:'ravi@volunteer.com', phone:'+919123456780', password:'Vol@123', role:'volunteer', isEmailVerified:true },
    { name:'Kavya Singh', email:'kavya@volunteer.com', phone:'+919123456781', password:'Vol@123', role:'volunteer', isEmailVerified:true },
  ]);

  // ── Create NGOs ───────────────────────────────
  const ngos = await NGO.create([
    { name:'Green Earth Foundation', description:'Environmental NGO collecting eco-friendly donations for underserved communities.', isVerified:true, rating:4.8, totalRatings:234, acceptingCategories:['Clothes','Books','Furniture','Electronics','Other'], address:{ line1:'Andheri East', city:'Mumbai', state:'Maharashtra', pin:'400069', lat:19.1196, lng:72.8468 }, contact:{ email:'info@greenearthfoundation.org', phone:'+912212345678' }, stats:{ itemsReceived:3200, donorsCount:450, totalFundsRaised:185000 }, zone:'A', isActive:true },
    { name:'Tech for All Kids', description:'Providing digital literacy and electronics to underprivileged children.', isVerified:true, rating:4.9, totalRatings:178, acceptingCategories:['Electronics','Books','Toys'], address:{ line1:'Koramangala', city:'Bengaluru', state:'Karnataka', pin:'560034', lat:12.9352, lng:77.6245 }, contact:{ email:'connect@techforallkids.org' }, stats:{ itemsReceived:1800, donorsCount:280, totalFundsRaised:92000 }, zone:'B', isActive:true },
    { name:'HopeShelter', description:'Providing shelter and essentials to homeless individuals across India.', isVerified:true, rating:4.7, totalRatings:312, acceptingCategories:['Clothes','Bedding','Kitchenware','Other'], address:{ line1:'Dharavi', city:'Mumbai', state:'Maharashtra', pin:'400017', lat:19.0422, lng:72.8552 }, contact:{ email:'hope@hopeshelter.in' }, stats:{ itemsReceived:5600, donorsCount:820, totalFundsRaised:340000 }, zone:'C', isActive:true },
    { name:'Vidya Foundation', description:'Education NGO focused on literacy and school supplies for rural India.', isVerified:true, rating:4.6, totalRatings:156, acceptingCategories:['Books','Electronics','Toys'], address:{ line1:'Borivali West', city:'Mumbai', state:'Maharashtra', pin:'400092', lat:19.2307, lng:72.8567 }, contact:{ email:'learn@vidyafoundation.org' }, stats:{ itemsReceived:2100, donorsCount:310, totalFundsRaised:78000 }, zone:'D', isActive:true },
  ]);

  // ── Create Vehicles ───────────────────────────
  await Vehicle.create([
    { vehicleId:'V-12', driverName:'Alex Ruiz', driver:volunteers[0]._id, capacity:20, loaded:14, zone:'Zone A', status:'active' },
    { vehicleId:'V-07', driverName:'S. Patel', capacity:20, loaded:18, zone:'Zone B', status:'active' },
    { vehicleId:'V-03', driverName:'M. Chen', capacity:20, loaded:5, zone:'Zone C', status:'idle' },
    { vehicleId:'V-15', driverName:'John Doe', capacity:20, loaded:8, zone:'Zone A', status:'active' },
    { vehicleId:'V-09', driverName:'Elena G.', capacity:20, loaded:11, zone:'Zone D', status:'active' },
  ]);

  // ── Create Donations ──────────────────────────
  const statusOptions = ['Requested','Scheduled','Collected','InTransit','Delivered'];
  const categories = ['Clothes','Books','Electronics','Toys','Furniture','Kitchenware','Bedding'];
  const conditions = ['Like New','Good','Gently Used'];
  const zones = ['Zone A','Zone B','Zone C','Zone D'];

  const donationData = [];
  const demoDetails = [
    { donor:donors[0], item:{ category:'Clothes', description:'5 cotton shirts, size M, slightly used but clean', quantity:5, condition:'Good' }, status:'Scheduled', zone:'Zone A' },
    { donor:donors[1], item:{ category:'Books', description:'15 textbooks for class 6-8, CBSE curriculum', quantity:15, condition:'Like New' }, status:'Delivered', zone:'Zone B' },
    { donor:donors[2], item:{ category:'Electronics', description:'Old smartphone and laptop in working condition', quantity:2, condition:'Good' }, status:'Collected', zone:'Zone C' },
    { donor:donors[3], item:{ category:'Furniture', description:'Wooden bookshelf, 4 shelves, good condition', quantity:1, condition:'Good' }, status:'InTransit', zone:'Zone A' },
    { donor:donors[4], item:{ category:'Bedding', description:'3 blankets and 5 bed sheets, winter items', quantity:8, condition:'Like New' }, status:'Delivered', zone:'Zone D' },
    { donor:donors[0], item:{ category:'Kitchenware', description:'Utensils, pots, pans - complete kitchen set', quantity:12, condition:'Gently Used' }, status:'Requested', zone:'Zone B' },
    { donor:donors[1], item:{ category:'Toys', description:'Educational toys and board games for kids 5-10', quantity:20, condition:'Like New' }, status:'Scheduled', zone:'Zone C' },
    { donor:donors[2], item:{ category:'Clothes', description:'Winter clothes - jackets, sweaters, warm clothing', quantity:25, condition:'Good' }, status:'Delivered', zone:'Zone A' },
  ];

  for (const d of demoDetails) {
    const ngo = ngos[Math.floor(Math.random() * ngos.length)];
    const vol = volunteers[Math.floor(Math.random() * volunteers.length)];
    const log = [{ status:'Requested', message:'Donation registered.', updatedBy:d.donor._id, timestamp: new Date(Date.now() - 5*24*60*60*1000) }];
    if (['Scheduled','Collected','InTransit','Delivered'].includes(d.status)) log.push({ status:'Scheduled', message:'Pickup scheduled.', updatedBy:vol._id, timestamp: new Date(Date.now() - 4*24*60*60*1000) });
    if (['Collected','InTransit','Delivered'].includes(d.status)) log.push({ status:'Collected', message:'Items collected from doorstep.', updatedBy:vol._id, timestamp: new Date(Date.now() - 3*24*60*60*1000) });
    if (['InTransit','Delivered'].includes(d.status)) log.push({ status:'InTransit', message:'En route to NGO.', updatedBy:vol._id, timestamp: new Date(Date.now() - 2*24*60*60*1000) });
    if (d.status === 'Delivered') log.push({ status:'Delivered', message:'Delivered to NGO successfully.', updatedBy:vol._id, timestamp: new Date(Date.now() - 1*24*60*60*1000) });

    donationData.push({
      donor: d.donor._id, ngo: ngo._id, volunteer: vol._id,
      item: { ...d.item, photos: [] },
      pickup: { address: d.donor.address, scheduledDate: new Date(Date.now() + 2*24*60*60*1000), timeSlot:'10:00 AM - 12:00 PM', zone: d.zone },
      status: d.status, trackingLog: log
    });
  }

  await Donation.create(donationData);

  // ── Create Notifications ──────────────────────
  await Notification.create([
    { recipient:admin._id, type:'pickup', title:'Vehicle V-03 Delayed', message:'Driver reported heavy traffic on Route A-12. Expected delay: 45 minutes.', isRead:false, isUrgent:true },
    { recipient:admin._id, type:'system', title:'New Donation: Rahul Gupta', message:'A new donation of 5 items has been logged in Zone B. Awaiting screening.', isRead:false },
    { recipient:admin._id, type:'pickup', title:'Zone A Threshold Reached', message:'Pickup requests in Zone A have exceeded daily capacity. Consider auxiliary vehicle.', isRead:false },
    { recipient:admin._id, type:'marketplace', title:'NGO Request Fulfilled', message:'HopeShelter\'s request for 50 winter coats has been fully matched.', isRead:true },
    { recipient:staff._id, type:'general', title:'Welcome!', message:'Your NGO staff account is ready.', isRead:false },
    ...donors.map(d => ({ recipient: d._id, type:'general', title:`Welcome ${d.name}!`, message:'Start your donation journey today.', isRead:false }))
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:    admin@donateease.org  / Admin@123');
  console.log('  NGO Staff:staff@donateease.org  / Staff@123');
  console.log('  Donor:    rahul@example.com     / Donor@123');
  console.log('  Donor:    ananya@example.com    / Donor@123');
  console.log('\n🚀 Run: npm run dev');

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
