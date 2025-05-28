 
// server/src/utils/responseHelper.js
const { HTTP_STATUS } = require('../config/constants');

const success = (res, data, message = 'Sucesso', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message = 'Erro interno do servidor', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

const validationError = (res, errors) => {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: 'Dados inválidos',
    errors
  });
};

const notFound = (res, message = 'Recurso não encontrado') => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message
  });
};

const unauthorized = (res, message = 'Acesso não autorizado') => {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message
  });
};

const forbidden = (res, message = 'Acesso negado') => {
  return res.status(HTTP_STATUS.FORBIDDEN).json({
    success: false,
    message
  });
};

const created = (res, data, message = 'Criado com sucesso') => {
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message,
    data
  });
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  created
};