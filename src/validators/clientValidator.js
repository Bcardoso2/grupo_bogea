 
// server/src/validators/clientValidator.js
const Joi = require('joi');

const createClientValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': 'Email deve ser válido'
  }),
  phone: Joi.string().max(20).allow('').optional(),
  cnpj: Joi.string().max(20).allow('').optional(),
  address: Joi.string().allow('').optional(),
  contact_person: Joi.string().max(100).allow('').optional(),
  notes: Joi.string().allow('').optional()
});

const updateClientValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  email: Joi.string().email().allow('').optional().messages({
    'string.email': 'Email deve ser válido'
  }),
  phone: Joi.string().max(20).allow('').optional(),
  cnpj: Joi.string().max(20).allow('').optional(),
  address: Joi.string().allow('').optional(),
  contact_person: Joi.string().max(100).allow('').optional(),
  status: Joi.string().valid('active', 'inactive').default('active'),
  notes: Joi.string().allow('').optional()
});

module.exports = {
  createClientValidator,
  updateClientValidator
};