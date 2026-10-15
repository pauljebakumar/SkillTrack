const mongoose = require('mongoose');

let isConnected = false;
let useMemoryFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log(`[SkillTrack] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[SkillTrack] MongoDB connection failed (${err.message}).`);
    console.warn(`[SkillTrack] Operating in Resilient Storage Mode (Local In-Memory / File-backed Cache).`);
    console.warn(`[SkillTrack] To use full MongoDB, configure MONGODB_URI in backend/.env`);
    useMemoryFallback = true;
  }
};

module.exports = { connectDB, isConnected: () => isConnected, isMemoryFallback: () => useMemoryFallback };
