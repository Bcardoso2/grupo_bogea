 
// server/src/validators/userValidator.js
const Joi = require('joi');

const createUserValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email deve ser válido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Senha é obrigatória',
    'string.min': 'Senha deve ter pelo menos 6 caracteres'
  }),
  role: Joi.string().valid('admin', 'user').default('user')
});

const updateUserValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email deve ser válido'
  }),
  role: Joi.string().valid('admin', 'user').required()
});

module.exports = {
  createUserValidator,
  updateUserValidator
};