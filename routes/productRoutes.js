const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  purchaseProduct,
  updateProductStock
} = require('../controllers/productController');

const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', auth, createProduct); // Only authenticated users can create products
router.post('/purchase', auth, purchaseProduct); // Only authenticated users can purchase
router.put('/:id/stock', auth, updateProductStock); // Only authenticated users can update stock

module.exports = router;
