const mongoose = require('mongoose');
const validator = require('validator'); // ADD THIS LINE

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'] // ADD THIS LINE
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    validate: {
      validator: function(pass) {
        // ADD THIS VALIDATION OBJECT
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(pass);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    required: [true, 'Role is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required for delivery'],
    minlength: [10, 'Address must be at least 10 characters'] // ADD THIS
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
  validator: function(phone) {
    const cleaned = phone.replace(/\s/g, '');
    // Remove plus and check if all digits + length
    const digitsOnly = cleaned.replace(/^\+/, '');
    return /^\d{10,15}$/.test(digitsOnly);
  },
  message: 'Phone number must be 10-15 digits'
}
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
  ],

  flagsCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);