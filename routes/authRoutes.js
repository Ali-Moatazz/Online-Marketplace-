const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation'); // ADD THIS LINE

// Public routes with validation
router.post('/register', validateRegistration, register); // ADD validateRegistration
router.post('/login', validateLogin, login);             // ADD validateLogin

// Protected route
router.get('/me', auth, getMe);

module.exports = router;