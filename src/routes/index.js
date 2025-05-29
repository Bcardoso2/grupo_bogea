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
const uploadRoutes = require('./upload.routes'); // Nova rota de upload

// Definir as rotas
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/documents', documentRoutes);
router.use('/contracts', contractRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes); // Nova rota de upload

// Rota de health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    routes: [
      'auth', 'clients', 'documents', 'contracts', 
      'projects', 'users', 'dashboard', 'upload'
    ]
  });
});

module.exports = router;