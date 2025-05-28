 
// server/src/validators/projectValidator.js
const Joi = require('joi');

const createProjectValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  description: Joi.string().allow('').optional(),
  client_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Cliente é obrigatório',
    'number.positive': 'Cliente inválido'
  }),
  contract_id: Joi.number().integer().positive().allow(null).optional(),
  start_date: Joi.date().allow(null).optional(),
  deadline: Joi.date().min(Joi.ref('start_date')).allow(null).optional().messages({
    'date.min': 'Prazo deve ser posterior à data de início'
  }),
  status: Joi.string().valid('planning', 'in_progress', 'on_hold', 'completed', 'cancelled').default('planning'),
  manager_id: Joi.number().integer().positive().allow(null).optional()
});

const updateProjectValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres'
  }),
  description: Joi.string().allow('').optional(),
  contract_id: Joi.number().integer().positive().allow(null).optional(),
  start_date: Joi.date().allow(null).optional(),
  deadline: Joi.date().min(Joi.ref('start_date')).allow(null).optional().messages({
    'date.min': 'Prazo deve ser posterior à data de início'
  }),
  status: Joi.string().valid('planning', 'in_progress', 'on_hold', 'completed', 'cancelled').required(),
  progress: Joi.number().min(0).max(100).default(0),
  manager_id: Joi.number().integer().positive().allow(null).optional()
});

module.exports = {
  createProjectValidator,
  updateProjectValidator
};
