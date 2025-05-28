 
// server/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator');

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', validate(createUserValidator), createUser);
router.put('/:id', validate(updateUserValidator), updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/change-password', changeUserPassword);

module.exports = router;