const express = require('express');
const router = express.Router();
const { createProduct, 
        getAllProducts,
        searchProducts, // <--- Import the new function
        getProductById,
        getCategories

 } = require('../controllers/productController');

router.post('/', createProduct);
router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
const { 
  createProduct, 
  getAllProducts, 
  getProductsByCategory,  // FROM YOUR VERSION
  getProductById, 
  purchaseProduct,
  updateProductStock,
  updateProduct,          // FROM YOUR VERSION
  deleteProduct           // FROM YOUR VERSION
} = require('../controllers/productController');

const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory); // YOUR ROUTE
router.get('/:id', getProductById);                       // HIS ROUTE

// Protected routes
router.post('/', auth, requireRole(['seller']), createProduct);
router.post('/purchase', auth, requireRole(['buyer']), purchaseProduct);
router.put('/:id/stock', auth, requireRole(['seller']), updateProductStock);
router.put('/:id', auth, requireRole(['seller']), updateProduct);        // YOUR ROUTE
router.delete('/:id', auth, requireRole(['seller']), deleteProduct);     // YOUR ROUTE

module.exports = router;