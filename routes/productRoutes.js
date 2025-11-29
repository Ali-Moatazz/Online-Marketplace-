const express = require('express');
const router = express.Router();

const { 
  createProduct, 
  getAllProducts, 
  getProductsByCategory, 
  getProductById,
  searchProducts, 
  getCategories,
  purchaseProduct,
  updateProductStock,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory); // YOUR ROUTE
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);                       // HIS ROUTE

// Protected routes
router.post('/', auth, requireRole(['seller']), createProduct);
router.post('/purchase', auth, requireRole(['buyer']), purchaseProduct);
router.put('/:id/stock', auth, requireRole(['seller']), updateProductStock);
router.put('/:id', auth, requireRole(['seller']), updateProduct);        // YOUR ROUTE
router.delete('/:id', auth, requireRole(['seller']), deleteProduct);     // YOUR ROUTE

module.exports = router;
