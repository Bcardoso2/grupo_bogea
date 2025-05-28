 
// server/src/middleware/error.middleware.js
const logger = require('../utils/logger');
const { error } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Erro de validação do Joi
  if (err.isJoi) {
    const errors = err.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  // Erro do MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'Registro já existe', 400);
  }

  // Erro de arquivo muito grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'Arquivo muito grande', 400);
  }

  // Erro padrão
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  
  return error(res, message, statusCode);
};

const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`
  });
};

module.exports = { errorHandler, notFound };