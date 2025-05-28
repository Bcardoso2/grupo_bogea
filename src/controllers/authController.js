 
// server/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error, unauthorized, created } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Verificar se o email já existe
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return error(res, 'Email já está em uso', 400);
  }
  
  // Criar novo usuário
  const user = await User.create({ name, email, password, role });
  
  // Gerar token JWT
  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  created(res, { user, token }, 'Usuário criado com sucesso');
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Buscar usuário por email (incluindo senha)
  const user = await User.findByEmail(email);
  if (!user) {
    return unauthorized(res, 'Email ou senha incorretos');
  }
  
  // Verificar senha
  const isPasswordValid = await User.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return unauthorized(res, 'Email ou senha incorretos');
  }
  
  // Gerar token JWT
  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  // Remover senha da resposta
  const { password: userPassword, ...userData } = user;
  
  success(res, { user: userData, token }, 'Login realizado com sucesso');
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  success(res, user, 'Perfil do usuário');
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  // Verificar se o email já existe (exceto do próprio usuário)
  const existingUser = await User.findByEmail(email);
  if (existingUser && existingUser.id !== req.user.id) {
    return error(res, 'Email já está em uso', 400);
  }
  
  const updatedUser = await User.update(req.user.id, { name, email, role: req.user.role });
  success(res, updatedUser, 'Perfil atualizado com sucesso');
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Buscar usuário atual com senha
  const user = await User.findByEmail(req.user.email);
  
  // Verificar senha atual
  const isCurrentPasswordValid = await User.verifyPassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return error(res, 'Senha atual incorreta', 400);
  }
  
  // Alterar senha
  await User.changePassword(req.user.id, newPassword);
  
  success(res, null, 'Senha alterada com sucesso');
});
