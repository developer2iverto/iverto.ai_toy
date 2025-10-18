const mongoose = require('mongoose');

let dbConnected = false;

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is not set. Please add it to your environment variables.");
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  dbConnected = true;
  console.log("✅ MongoDB connected");
})
.catch((err) => {
  dbConnected = false;
  console.error("❌ MongoDB connection failed. Error:", err.message);
});

module.exports = { dbConnected };
