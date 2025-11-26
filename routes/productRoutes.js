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

module.exports = router;
