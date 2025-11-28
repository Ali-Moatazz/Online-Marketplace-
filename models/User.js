const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: [true, 'Role is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required for delivery']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  // Seller specific fields
  storeName: {
    type: String
  },
  rating_seller: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  serviceArea: {
    type: String
  },

  // --- NEW: Store Seller's Email Credentials ---
  // WARNING: In production, this field should be encrypted at rest!
  googleAppPassword: { 
    type: String, 
    select: false // Do not return this by default in API calls for security
  },

  // Embedded Notifications
  notifications: [
    {
      message: { type: String, required: true },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);