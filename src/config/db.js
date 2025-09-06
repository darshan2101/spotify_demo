const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
