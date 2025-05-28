 
// server/src/controllers/userController.js
const User = require('../models/User');
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  
  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role
  };
  
  const users = await User.findAll(filters);
  const total = await User.count(filters);
  
  success(res, {
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    return notFound(res, 'Usuário não encontrado');
  }
  
  success(res, user);
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Verificar se o email já existe
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return error(res, 'Email já está em uso', 400);
  }
  
  const user = await User.create({ name, email, password, role });
  
  created(res, user, 'Usuário criado com sucesso');
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  
  const existingUser = await User.findById(id);
  if (!existingUser) {
    return notFound(res, 'Usuário não encontrado');
  }
  
  // Verificar se o email já existe (exceto do próprio usuário)
  const emailUser = await User.findByEmail(email);
  if (emailUser && emailUser.id !== parseInt(id)) {
    return error(res, 'Email já está em uso', 400);
  }
  
  const updatedUser = await User.update(id, { name, email, role });
  
  success(res, updatedUser, 'Usuário atualizado com sucesso');
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return notFound(res, 'Usuário não encontrado');
  }
  
  // Não permitir que o usuário exclua a si mesmo
  if (parseInt(id) === req.user.id) {
    return error(res, 'Você não pode excluir sua própria conta', 400);
  }
  
  await User.delete(id);
  
  success(res, null, 'Usuário excluído com sucesso');
});

exports.changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  
  const user = await User.findById(id);
  if (!user) {
    return notFound(res, 'Usuário não encontrado');
  }
  
  await User.changePassword(id, newPassword);
  
  success(res, null, 'Senha do usuário alterada com sucesso');
});