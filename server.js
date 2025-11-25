const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(cors());

// =======================
// Routes
// =======================

// ----- Existing APIs (already in your last working server) ----- //

// Flags API
const flagRoutes = require('./routes/flagRoutes');
app.use('/api/flags', flagRoutes);

// Reviews API
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// Products API
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Orders API
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// ----- NEW: Users API (added from friend's work) ----- //
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// Note: make sure your routes/userRoutes.js has the auth middleware applied to profile routes

// =======================
// Test route
// =======================
app.get('/', (req, res) => res.send('Server is running!'));

// =======================
// Start server + connect to MongoDB
// =======================

const PORT = process.env.PORT || 5000;

// ---- Using .env variable or fallback to local MongoDB ---- //
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marketplace';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('⚠️ MongoDB connection error:', err));
