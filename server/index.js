const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Load environment variables first
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Farmer Schema
const farmerSchema = new mongoose.Schema({
  // Basic Information
  registrationDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  farmerName: { 
    type: String, 
    required: true,
    trim: true
  },
  fatherSpouseName: { 
    type: String, 
    required: true,
    trim: true
  },
  contactNumber: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Please enter a valid email']
  },
  village: { 
    type: String, 
    required: true,
    trim: true
  },
  mandal: { 
    type: String, 
    required: true,
    trim: true
  },
  district: { 
    type: String, 
    required: true,
    trim: true
  },
  state: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Farm & Crop Details
  totalLand: { 
    type: Number, 
    required: true,
    min: [0, 'Total land area must be positive']
  },
  naturalFarmingArea: { 
    type: Number, 
    required: true,
    min: [0, 'Natural farming area must be positive'],
    validate: {
      validator: function(v) {
        return v <= this.totalLand;
      },
      message: 'Natural farming area cannot exceed total land area'
    }
  },
  presentCrop: { 
    type: String, 
    required: true,
    trim: true
  },
  cropTypes: { 
    type: String, 
    required: true,
    trim: true
  },
  sowingDate: { 
    type: Date, 
    required: true 
  },
  harvestingDate: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !this.sowingDate || v > this.sowingDate;
      },
      message: 'Harvesting date must be after sowing date'
    }
  },
  currentFarmingPractice: { 
    type: String, 
    required: true,
    enum: ['Natural', 'Organic', 'Conventional', 'Chemical']
  },
  farmingExperience: { 
    type: Number, 
    required: true,
    min: [0, 'Experience years must be positive']
  },
  irrigationSource: { 
    type: String, 
    required: true,
    enum: ['Borewell', 'Canal', 'Rainfed', 'Other']
  },
  
  // Livestock & Preferences
  livestock: [{ 
    type: String,
    enum: ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Pig', 'Fish', 'Other']
  }],
  willingToAdoptNaturalInputs: { 
    type: String, 
    required: true,
    enum: ['Yes', 'No', 'Maybe']
  },
  trainingRequired: { 
    type: String, 
    required: true 
  },
  localGroupName: { 
    type: String 
  },
  preferredCroppingSeason: { 
    type: String, 
    required: true 
  },
  remarks: { 
    type: String 
  },
  
  // System & Payment Fields
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'initiated', 'completed'],
    default: 'pending'
  },
  paymentId: { 
    type: String 
  },
  paymentDate: { 
    type: Date 
  }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};

// Initiate payment first
app.post('/api/initiate-payment', async (req, res, next) => {
  try {
    // Validate the farmer data first
    const farmer = new Farmer(req.body);
    await farmer.validate();

    // Create payment order
    const order = await razorpay.orders.create({
      amount: 30000, // Rs. 300 expressed in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        farmerData: JSON.stringify(req.body)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        },
        key: process.env.RAZORPAY_KEY_ID
      },
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment and complete registration
app.post('/api/complete-registration', async (req, res, next) => {
  try {
    const { 
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      farmerData 
    } = req.body;

    // Verify payment signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Please contact support.'
      });
    }

    // After payment is verified, save farmer data
    const farmer = new Farmer({
      ...farmerData,
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      paymentDate: new Date()
    });

    await farmer.save();

    res.status(201).json({
      success: true,
      message: 'Payment verified and registration completed successfully',
      data: {
        farmerId: farmer._id,
        registrationDate: farmer.registrationDate
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create new farmer registration (pre-payment)
app.post('/api/farmers', async (req, res, next) => {
  try {
    const farmer = new Farmer({
      ...req.body,
      paymentStatus: 'pending'
    });
    await farmer.save();

    res.status(201).json({
      success: true,
      farmerId: farmer._id
    });
  } catch (error) {
    next(error);
  }
});

// Create payment order
app.post('/api/create-payment', async (req, res, next) => {
  try {
    const order = await razorpay.orders.create({
      amount: 30000, // Rs. 300 expressed in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        type: 'farmer_registration'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency
        },
        key: process.env.RAZORPAY_KEY_ID
      },
      message: 'Payment order created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment and update farmer
app.post('/api/verify-payment', async (req, res, next) => {
  try {
    const { 
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      farmerId 
    } = req.body;

    // Verify payment signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update existing farmer with payment details
    const farmer = await Farmer.findByIdAndUpdate(
      farmerId,
      {
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id,
        paymentDate: new Date()
      },
      { new: true }
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and farmer updated successfully',
      data: {
        farmerId: farmer._id
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all farmers
app.get('/api/farmers', async (req, res, next) => {
  try {
    const farmers = await Farmer.find({});
    res.json({ 
      success: true, 
      data: farmers 
    });
  } catch (error) {
    next(error);
  }
});

// Get farmer details by ID
app.get('/api/farmers/:id', async (req, res, next) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }
    res.json({
      success: true,
      data: farmer
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
