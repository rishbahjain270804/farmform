const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

// Function to run a command and pipe output
const runCommand = (command, cwd) => {
  const childProcess = exec(command, { cwd });
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return new Promise((resolve, reject) => {
    childProcess.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
};

const startAll = async () => {
  try {
    // Check MongoDB connection first
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    mongoose.disconnect();

    // Start backend
    console.log('Starting backend server...');
    exec('node server.js', { cwd: __dirname });

    // Start frontend
    console.log('Starting frontend...');
    exec('npm run dev', { cwd: path.join(__dirname, '..') });

    console.log('\n🚀 Application started!');
    console.log('Backend running on: http://localhost:5000');
    console.log('Frontend running on: http://localhost:5173');
    console.log('Admin panel: http://localhost:5173/admin');
    console.log('\nPress Ctrl+C to stop all servers\n');
  } catch (error) {
    console.error('❌ Failed to start:', error.message);
    if (error.message.includes('MongoDB')) {
      console.log('\n⚠️ Please make sure:');
      console.log('1. MongoDB is installed and running');
      console.log('2. MONGODB_URI in .env is correct');
      console.log('3. Database user has proper permissions');
    }
    process.exit(1);
  }
};

startAll();