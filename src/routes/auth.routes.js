 
// server/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

router.post('/register', validate(registerValidator), register);
router.post('/login', validate(loginValidator), login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
