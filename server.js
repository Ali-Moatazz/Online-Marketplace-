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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
const flagRoutes = require('./routes/flagRoutes');
app.use('/api/flags', flagRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        profile: 'GET /api/users/profile (protected)',
        updateProfile: 'PUT /api/users/profile (protected)'
      },
      flags: {
        create: 'POST /api/flags',
        getReported: 'GET /api/flags/reported/:userId',
        updateStatus: 'PUT /api/flags/:id/status'
      }
    }
  });
});

// Start server and connect to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('⚠️ MongoDB connection error:', err));
