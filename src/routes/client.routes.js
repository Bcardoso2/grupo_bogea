 
// server/src/routes/client.routes.js
const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientDocuments,
  getClientContracts,
  getClientProjects
} = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createClientValidator, updateClientValidator } = require('../validators/clientValidator');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', validate(createClientValidator), createClient);
router.put('/:id', validate(updateClientValidator), updateClient);
router.delete('/:id', deleteClient);
router.get('/:id/documents', getClientDocuments);
router.get('/:id/contracts', getClientContracts);
router.get('/:id/projects', getClientProjects);

module.exports = router;