 
// server/src/routes/index.js
const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./auth.routes');
const clientRoutes = require('./client.routes');
const documentRoutes = require('./document.routes');
const contractRoutes = require('./contract.routes');
const projectRoutes = require('./project.routes');
const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');

// Definir as rotas
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/documents', documentRoutes);
router.use('/contracts', contractRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;