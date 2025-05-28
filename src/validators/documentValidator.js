 
// server/src/validators/documentValidator.js
const Joi = require('joi');

const uploadDocumentValidator = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.min': 'Título deve ter pelo menos 2 caracteres',
    'string.max': 'Título deve ter no máximo 100 caracteres'
  }),
  description: Joi.string().allow('').optional(),
  category: Joi.string().valid('contract', 'proposal', 'invoice', 'report', 'other').default('other'),
  client_id: Joi.number().integer().positive().allow(null).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').default('active')
});

const updateDocumentValidator = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.min': 'Título deve ter pelo menos 2 caracteres',
    'string.max': 'Título deve ter no máximo 100 caracteres'
  }),
  description: Joi.string().allow('').optional(),
  category: Joi.string().valid('contract', 'proposal', 'invoice', 'report', 'other').required(),
  client_id: Joi.number().integer().positive().allow(null).optional(),
  status: Joi.string().valid('draft', 'active', 'archived').required()
});

module.exports = {
  uploadDocumentValidator,
  updateDocumentValidator
};