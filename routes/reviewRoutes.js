const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByProduct,
  deleteReview
} = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/product/:productId', getReviewsByProduct);
router.delete('/:id', deleteReview);

module.exports = router;
