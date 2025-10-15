require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const json2csv = require('json2csv').Parser;
const connectDB = require('./config/db');
const Farmer = require('./models/Farmer');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const toDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const mapRegistrationPayload = (payload = {}) => ({
  registrationDate: toDate(payload.registrationDate) || new Date(),
  name: payload.farmerName,
  fatherName: payload.fatherSpouseName,
  phone: payload.contactNumber,
  email: payload.email,
  aadhaar: payload.aadhaarFarmerId,
  village: payload.village,
  block: payload.mandal,
  district: payload.district,
  state: payload.state,
  pincode: payload.pincode,
  landSize: parseNumber(payload.totalLand),
  areaNatural: parseNumber(payload.naturalFarmingArea),
  presentCrop: payload.presentCrop,
  cropTypes: payload.cropTypes,
  sowingDate: toDate(payload.sowingDate),
  harvestingDate: toDate(payload.harvestingDate),
  practice: payload.currentFarmingPractice,
  yearsExperience: parseNumber(payload.farmingExperience),
  irrigation: payload.irrigationSource,
  livestock: Array.isArray(payload.livestock) ? payload.livestock : [],
  adoptInputs: payload.willingToAdoptNaturalInputs,
  training: payload.trainingRequired,
  group: payload.localGroupName,
  season: payload.preferredCroppingSeason,
  remarks: payload.remarks,
  status: 'pending',
  paymentStatus: 'pending',
  submittedAt: new Date(),
  updatedAt: new Date()
});

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer-form')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api', paymentRoutes);

// Protected farmer routes
app.get('/api/farmers', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
      district,
      state,
      practice,
      dateFrom,
      dateTo,
      landSizeMin,
      landSizeMax
    } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }

    // Advanced filters
    if (district) query.district = district;
    if (state) query.state = state;
    if (practice) query.practice = practice;
    
    if (dateFrom || dateTo) {
      query.submittedAt = {};
      if (dateFrom) query.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) query.submittedAt.$lte = new Date(dateTo);
    }
    
    if (landSizeMin || landSizeMax) {
      query.landSize = {};
      if (landSizeMin) query.landSize.$gte = parseFloat(landSizeMin);
      if (landSizeMax) query.landSize.$lte = parseFloat(landSizeMax);
    }

    // Add aggregation for statistics
    const stats = await Farmer.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLandSize: { $sum: '$landSize' },
          avgLandSize: { $avg: '$landSize' },
          naturalCount: { $sum: { $cond: [{ $eq: ['$practice', 'Natural'] }, 1, 0] } },
          organicCount: { $sum: { $cond: [{ $eq: ['$practice', 'Organic'] }, 1, 0] } }
        }
      }
    ]);

    const farmers = await Farmer.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Farmer.countDocuments(query);

    res.json({
      farmers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      stats: stats[0] || {
        totalLandSize: 0,
        avgLandSize: 0,
        naturalCount: 0,
        organicCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new farmer registration
app.post('/api/farmers', async (req, res) => {
  try {
    const farmerData = mapRegistrationPayload(req.body);
    const farmer = new Farmer(farmerData);
    await farmer.save();
    res.status(201).json({ farmerId: farmer._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update farmer status
app.patch('/api/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    const farmer = await Farmer.findByIdAndUpdate(id, update, { new: true });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get farmer by ID
app.get('/api/farmers/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete farmer (if needed)
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndDelete(req.params.id);
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    res.json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export farmers data
app.get('/api/farmers/export', auth, async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;
    
    // Apply the same filters as the main endpoint
    const query = {};
    if (filters.status && filters.status !== 'all') query.status = filters.status;
    if (filters.district) query.district = filters.district;
    if (filters.state) query.state = filters.state;
    if (filters.practice) query.practice = filters.practice;
    
    const farmers = await Farmer.find(query).lean();

    if (format === 'csv') {
      const fields = [
        'name', 'fatherName', 'phone', 'email', 'aadhaar',
        'village', 'block', 'district', 'state', 'pincode',
        'landSize', 'areaNatural', 'presentCrop', 'practice',
        'irrigation', 'status', 'submittedAt'
      ];

      const json2csvParser = new json2csv({ fields });
      const csv = json2csvParser.parse(farmers);
      
      res.header('Content-Type', 'text/csv');
      res.attachment('farmers-' + new Date().toISOString().split('T')[0] + '.csv');
      return res.send(csv);
    }

    // JSON format
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
