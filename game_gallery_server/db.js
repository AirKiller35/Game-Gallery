const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We use the URI from the .env file (mongodb://mongo:27017/game_gallery)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit the process if the database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;