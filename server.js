const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const flagRoutes = require('./routes/flagRoutes');
app.use('/api/flags', flagRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// Test route
app.get('/', (req, res) => res.send('Server is running!'));

// Start server + connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/marketplace')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
