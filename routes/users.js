const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, 'user-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET USER PROFILE - GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
});

// UPDATE USER PROFILE - PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, address, phone, serviceArea } = req.body;
    
    // Fields that can be updated
    const updateFields = {};
    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    if (phone) updateFields.phone = phone;
    if (serviceArea) updateFields.serviceArea = serviceArea;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
});

// GET ALL SELLERS - GET /api/users/sellers
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('name email phone address serviceArea rating_seller createdAt');
    
    res.json({
      message: 'Sellers retrieved successfully',
      sellers,
      count: sellers.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching sellers', 
      error: error.message 
    });
  }
});

// GET SELLER BY ID - GET /api/users/sellers/:id
router.get('/sellers/:id', async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    }).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json({
      message: 'Seller retrieved successfully',
      seller
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching seller', 
      error: error.message 
    });
  }
});

module.exports = router;