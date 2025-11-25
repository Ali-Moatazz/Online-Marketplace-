const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  deliveryTimeEstimate: { type: String },
  stock: { type: Number, default: 0 },
  images: [String],
  rating_average: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
