const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    // Wait for MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = new Admin({
      username: 'admin',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin',
      name: 'System Admin',
      email: 'admin@example.com'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change these credentials after first login');
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    process.exit(0);
  }
};

setupAdmin();