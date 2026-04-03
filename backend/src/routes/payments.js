const router = require('express').Router();
const pc = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const express = require('express');

router.post('/webhook', express.raw({ type:'application/json' }), pc.webhook);
router.use(protect);
router.post('/create-order', pc.createOrder);
router.post('/verify', pc.verify);
router.get('/history', pc.history);
module.exports = router;
