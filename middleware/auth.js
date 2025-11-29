const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // 🔧 FIX: Add same fallback JWT secret as in authController.js
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'development_secret_key_min_32_chars_long_123456789'
    );
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

   req.user = {
      userId: user._id.toString(), // Ensure it's a string
      id: user._id.toString(),     // Add both for compatibility
      role: user.role,
      name: user.name,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: error.message // Added for debugging
    });
  }
};

// Optional: Middleware to check specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { auth, requireRole };