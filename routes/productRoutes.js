const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getAllProducts, 
  getProductsByCategory, // new
  updateProduct,   
  deleteProduct    
} = require('../controllers/productController');

// Create a new product
router.post('/', createProduct);

// Get all products
router.get('/', getAllProducts);

// Get products by category
router.get('/category/:category', getProductsByCategory); // new

// Update a product by ID
router.put('/:id', updateProduct);

// Delete a product by ID
router.delete('/:id', deleteProduct);

module.exports = router;
