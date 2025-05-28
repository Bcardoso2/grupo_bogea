 
// server/src/validators/contractValidator.js
const Joi = require('joi');

const createContractValidator = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.min': 'Título deve ter pelo menos 2 caracteres',
    'string.max': 'Título deve ter no máximo 100 caracteres'
  }),
  client_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Cliente é obrigatório',
    'number.positive': 'Cliente inválido'
  }),
  start_date: Joi.date().required().messages({
    'date.base': 'Data de início é obrigatória'
  }),
  end_date: Joi.date().min(Joi.ref('start_date')).allow(null).optional().messages({
    'date.min': 'Data de fim deve ser posterior à data de início'
  }),
  value: Joi.number().positive().allow(null).optional().messages({
    'number.positive': 'Valor deve ser positivo'
  }),
  status: Joi.string().valid('draft', 'pending', 'active', 'completed', 'cancelled').default('draft'),
  document_id: Joi.number().integer().positive().allow(null).optional(),
  description: Joi.string().allow('').optional(),
  responsible_id: Joi.number().integer().positive().allow(null).optional()
});

const updateContractValidator = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.min': 'Título deve ter pelo menos 2 caracteres',
    'string.max': 'Título deve ter no máximo 100 caracteres'
  }),
  contract_number: Joi.string().max(50).allow('').optional(),
  start_date: Joi.date().required().messages({
    'date.base': 'Data de início é obrigatória'
  }),
  end_date: Joi.date().min(Joi.ref('start_date')).allow(null).optional().messages({
    'date.min': 'Data de fim deve ser posterior à data de início'
  }),
  value: Joi.number().positive().allow(null).optional().messages({
    'number.positive': 'Valor deve ser positivo'
  }),
  status: Joi.string().valid('draft', 'pending', 'active', 'completed', 'cancelled').required(),
  document_id: Joi.number().integer().positive().allow(null).optional(),
  description: Joi.string().allow('').optional(),
  responsible_id: Joi.number().integer().positive().allow(null).optional()
});

module.exports = {
  createContractValidator,
  updateContractValidator
};