 
// server/src/routes/contract.routes.js
const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
  getExpiringContracts
} = require('../controllers/contractController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createContractValidator, updateContractValidator } = require('../validators/contractValidator');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', getContracts);
router.get('/expiring', getExpiringContracts);
router.get('/:id', getContract);
router.post('/', validate(createContractValidator), createContract);
router.put('/:id', validate(updateContractValidator), updateContract);
router.delete('/:id', deleteContract);

module.exports = router;