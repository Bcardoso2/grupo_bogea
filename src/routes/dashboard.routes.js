 
// server/src/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticação
router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

module.exports = router;