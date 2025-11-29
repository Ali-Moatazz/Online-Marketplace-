const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, address, phone, storeName, serviceArea,googleAppPassword } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    user = new User({
      name, email, password, role, address, phone,
      ...(role === 'seller' && { storeName, serviceArea,  googleAppPassword })
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'development_secret_key_min_32_chars_long_123456789',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        address: user.address, phone: user.phone,
        ...(user.role === 'seller' && { storeName: user.storeName, serviceArea: user.serviceArea })
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'development_secret_key_min_32_chars_long_123456789',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        address: user.address, phone: user.phone,
        ...(user.role === 'seller' && { 
          storeName: user.storeName, 
          serviceArea: user.serviceArea,
          rating_seller: user.rating_seller 
        })
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};