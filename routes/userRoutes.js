const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation'); // ADD THIS
// Public routes


router.get('/sellers', userController.getSellers);
router.get('/sellers/:id', userController.getSellerById);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;