const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// ========================
// YOUR FEATURES + HIS SECURITY
// ========================

exports.createProduct = async (req, res) => {
  try {
    // HIS SECURITY: Check if user has seller role
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        success: false,
        error: 'Only sellers can create products' 
      });
    }

    // HIS FEATURE: Auto-assign sellerId
    const productData = {
      ...req.body,
      sellerId: req.user.userId
    };
    
    // YOUR FEATURE: Basic product creation
    const product = await Product.create(productData);
    
    // HIS RESPONSE FORMAT
    res.status(201).json({
      success: true,
      product
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // HIS IMPROVEMENT: Populate seller info
    const products = await Product.find().populate('sellerId', 'name email');
    
    // HIS RESPONSE FORMAT
    res.json({
      success: true,
      products
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ========================
// YOUR EXCLUSIVE FEATURES
// ========================

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category }).populate('sellerId', 'name email');
    
    // UPDATED: Use his response format
    res.json({
      success: true,
      products
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // YOUR FEATURE: Basic update + HIS SECURITY
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // HIS SECURITY: Check ownership
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to update this product' 
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    
    // UPDATED: Use his response format
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // YOUR FEATURE: Basic delete + HIS SECURITY
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // HIS SECURITY: Check ownership
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to delete this product' 
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    
    // UPDATED: Use his response format
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// ========================
// HIS EXCLUSIVE FEATURES
// ========================

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email');
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    res.json({
      success: true,
      product
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.purchaseProduct = async (req, res) => {
  try {
    // Check if user has buyer role
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ 
        success: false,
        error: 'Only buyers can purchase products' 
      });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false,
        error: `Insufficient stock. Only ${product.stock} items available` 
      });
    }

    // Reduce stock
    product.stock -= quantity;
    await product.save();

    const totalPrice = product.price * quantity;

    // Create order
    const order = await Order.create({
      userId: userId,
      products: [{
        productId,
        quantity
      }],
      totalPrice,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      order: order,
      remainingStock: product.stock
    });

  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.updateProductStock = async (req, res) => {
  try {
    // Check if user has seller role
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        success: false,
        error: 'Only sellers can update product stock' 
      });
    }

    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Check if user is the seller of this product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Not authorized to update this product' 
      });
    }

    product.stock = stock;
    await product.save();
    
    res.json({ 
      success: true,
      message: 'Stock updated successfully', 
      product 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};