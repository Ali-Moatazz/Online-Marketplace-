const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes (no auth middleware)
router.post('/register', register);
router.post('/login', login);

// Protected route (uses auth middleware)
router.get('/me', auth, getMe);

module.exports = router;
