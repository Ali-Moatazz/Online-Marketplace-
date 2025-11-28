const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder,
  getUserOrders
} = require('../controllers/orderController');

const { auth } = require('../middleware/auth');

// All order routes require authentication
router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/user/:userId', auth, getUserOrders);
router.put('/:id', auth, updateOrder);
router.delete('/:id', auth, deleteOrder);

module.exports = router;