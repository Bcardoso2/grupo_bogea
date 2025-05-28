 
// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized, forbidden } = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return unauthorized(res, 'Usuário não encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token inválido ou expirado');
    }
    return unauthorized(res, 'Erro na autenticação');
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return forbidden(res, 'Acesso restrito a administradores');
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
