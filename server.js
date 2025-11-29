const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables FIRST with override
dotenv.config({ override: true });

// Verify essential environment variables are loaded
console.log('🔍 Checking environment variables...');
const requiredEnvVars = ['GROQ_API_KEY', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: ${envVar} is not set in environment variables`);
    console.log('💡 Make sure you have a .env file in your project root');
    process.exit(1);
  } else {
    console.log(`✅ ${envVar}: Loaded successfully`);
  }
}

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(cors());

// =======================
// Routes
// =======================

// ----- AUTH API (MUST BE FIRST) ----- //
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ----- Users API ----- //
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// ----- Products API ----- //
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// ----- Orders API ----- //
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// ----- Reviews API ----- //
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// ----- Flags API ----- //
const flagRoutes = require('./routes/flagRoutes');
app.use('/api/flags', flagRoutes);

// =======================
// Test route
// =======================
app.get('/', (req, res) => res.send('Server is running!'));

// =======================
// Start server + connect to MongoDB
// =======================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/MarketPlace';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`🤖 GROQ API Key: ${process.env.GROQ_API_KEY ? 'Loaded' : 'Missing'}`);
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('⚠️ MongoDB connection error:', err);
    process.exit(1);
  });