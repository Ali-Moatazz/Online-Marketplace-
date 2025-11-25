const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// =========================
// Middleware
// =========================
app.use(express.json());
app.use(cors());

// =========================
// Flags API Routes
// =========================
const flagRoutes = require('./routes/flagRoutes');
app.use('/api/flags', flagRoutes);

// =========================
// Reviews API Routes
// =========================
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// =========================
// Products API Routes
// =========================
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// =========================
// Orders API Routes
// =========================
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// =========================
// Test Route
// =========================
app.get('/', (req, res) => res.send('Server is running!'));

// =========================
// Start server + connect MongoDB
// =========================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));
