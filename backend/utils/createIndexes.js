const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    // Farmer model indexes
    await mongoose.model('Farmer').collection.createIndexes([
      { key: { phone: 1 }, unique: true },
      { key: { aadhaar: 1 }, unique: true },
      { key: { status: 1 } }, // For status filtering
      { key: { district: 1 } }, // For location filtering
      { key: { state: 1 } }, // For location filtering
      { key: { submittedAt: -1 } }, // For sorting by date
      { key: { landSize: 1 } }, // For land size filtering
      { key: { practice: 1 } }, // For farming practice filtering
      // Compound indexes for common query patterns
      { key: { status: 1, district: 1 } },
      { key: { status: 1, submittedAt: -1 } }
    ]);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

module.exports = createIndexes;