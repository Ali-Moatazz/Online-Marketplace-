const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

// Create Order
router.post('/', createOrder);

// Get All Orders
router.get('/', getOrders);

// Update Order
router.put('/:id', updateOrder);

// Delete Order
router.delete('/:id', deleteOrder);

module.exports = router;
