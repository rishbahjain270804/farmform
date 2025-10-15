const express = require('express');
const router = express.Router();
const razorpay = require('../config/razorpay');
const Farmer = require('../models/Farmer');
const crypto = require('crypto');

// Create Razorpay Order
router.post('/create-payment', async (req, res) => {
  try {
    const { farmerId } = req.body;
    
    if (!farmerId) {
      return res.status(400).json({ message: 'farmerId is required to create a payment order' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Fixed amount for registration (Rs. 300 expressed in paise)
    const amount = 30000;

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${farmerId || Date.now()}`,
      notes: {
        farmerId: farmerId.toString(),
        farmerName: farmer.name || farmerId.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    await Farmer.findByIdAndUpdate(farmerId, {
      paymentStatus: 'initiated',
      paymentDetails: {
        orderId: order.id,
        amount: amount / 100,
        paidAt: null
      },
      updatedAt: new Date()
    });

    res.json({
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify payment signature
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      farmerId
    } = req.body;

    if (!farmerId) {
      return res.status(400).json({
        success: false,
        message: 'farmerId is required for payment verification'
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment identifiers'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured'
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update farmer payment status
      await Farmer.findByIdAndUpdate(farmerId, {
        paymentStatus: 'completed',
        paymentDetails: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          amount: 300,
          paidAt: new Date()
        },
        updatedAt: new Date()
      });

      return res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
});

// Get payment details
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ message: 'Error fetching payment details' });
  }
});

module.exports = router;
