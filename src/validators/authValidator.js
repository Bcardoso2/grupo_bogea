 
// server/src/validators/authValidator.js
const Joi = require('joi');

const registerValidator = Joi.object({
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

const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email é obrigatório',
    'string.email': 'Email deve ser válido'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Senha é obrigatória'
  })
});

module.exports = {
  registerValidator,
  loginValidator
};
