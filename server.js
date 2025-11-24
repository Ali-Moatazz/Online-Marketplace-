const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.log('⚠️ MongoDB not connected - running without database');
  console.log('💡 Install MongoDB or continue without it for testing');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ User API is working!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        profile: 'GET /api/users/profile (protected)',
        updateProfile: 'PUT /api/users/profile (protected)'
      }
    }
  });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 User API running on port ${PORT}`);
  console.log(`📱 Test at: http://localhost:${PORT}`);
});