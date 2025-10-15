const mongoose = require('mongoose');
require('dotenv').config();

const checkConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collections`);
    
    // Test write permission
    const testCollection = mongoose.connection.collection('connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteOne({ test: true });
    console.log('✅ Write permission verified');

    console.log('\nAll checks passed! Your MongoDB connection is ready to use.');
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error(error.message);
    
    console.log('\n🔍 Troubleshooting steps:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify your connection string in .env file');
    console.log('3. Ensure network connectivity to MongoDB server');
    console.log('4. Check if database user has proper permissions');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure MongoDB server is running on the specified host and port');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Tip: Double-check your database username and password');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkConnection();