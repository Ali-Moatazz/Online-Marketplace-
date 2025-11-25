const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getReviewSummary // <--- 1. Import the new function
} = require('../controllers/reviewController');

// Existing routes
router.post('/', createReview);
router.get('/product/:productId', getReviewsByProduct);
router.delete('/:id', deleteReview);

// --- NEW ROUTE ---
// This connects GET /api/reviews/summary/123 to your AI function
router.get('/summary/:productId', getReviewSummary); 

module.exports = router;