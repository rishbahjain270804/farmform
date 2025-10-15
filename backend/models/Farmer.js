const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  // Basic Info
  registrationDate: { type: Date, default: Date.now },
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  aadhaar: { type: String, required: true, trim: true },
  
  // Address
  village: { type: String, required: true, trim: true },
  block: { type: String, trim: true },
  district: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, trim: true },

  // Farm Details
  landSize: { type: Number, required: true },
  areaNatural: { type: Number, required: true },
  presentCrop: { type: String, trim: true },
  cropTypes: { type: String, trim: true },
  sowingDate: Date,
  harvestingDate: Date,
  practice: { type: String, required: true, trim: true },
  yearsExperience: Number,
  irrigation: { type: String, required: true, trim: true },
  livestock: {
    type: [String],
    default: []
  },
  adoptInputs: { type: String, trim: true },
  training: { type: String, trim: true },
  group: { type: String, trim: true },
  season: { type: String, trim: true },
  remarks: { type: String, trim: true },

  // Status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'initiated', 'completed'], 
    default: 'pending' 
  },
  paymentDetails: {
    orderId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    signature: { type: String, trim: true },
    amount: Number,
    paidAt: Date
  },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster searches
farmerSchema.index({ phone: 1, aadhaar: 1 });
farmerSchema.index({ status: 1, district: 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
