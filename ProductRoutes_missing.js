const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getAllProducts, 
  searchProducts // <--- Import the new function
} = require('../controllers/productController');

// 1. Create a product (Seller)
router.post('/', createProduct);

// 2. Search products (Buyer) - This must be defined BEFORE generic routes
router.get('/search', searchProducts);

// 3. Get all products (Buyer)
router.get('/', getAllProducts);

router.get('/:id', getProductById);

module.exports = router;