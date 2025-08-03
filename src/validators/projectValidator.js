// server/src/validators/projectValidator.js
const Joi = require('joi');

exports.createProjectValidator = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(1000).allow(null, ''),
  client_id: Joi.number().integer().positive().required(),
  contract_id: Joi.number().integer().positive().optional().allow(null),
  start_date: Joi.date().iso().required(),
  deadline: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid('planning', 'in_progress', 'on_hold', 'completed', 'cancelled').default('planning'),
  manager_id: Joi.number().integer().positive().required(),
  progress: Joi.number().integer().min(0).max(100).default(0).optional(),
  
  // Campos específicos de requerimento
  type_requirement: Joi.string().valid('Salário Maternidade', 'BPC Loas', 'Aposentadoria').optional().allow(null, ''),
  specific_ocupacao: Joi.string().max(255).optional().allow(null, ''),
  specific_filho_ano: Joi.string().max(50).optional().allow(null, ''),
  specific_honorarios: Joi.number().optional().allow(null),
  specific_vara_do_processo: Joi.string().max(255).optional().allow(null, ''),
  specific_tipo_de_deficiencia: Joi.string().max(255).optional().allow(null, ''),
  specific_data_pericia: Joi.date().iso().optional().allow(null, ''),
  specific_data_pericia_social: Joi.date().iso().optional().allow(null, ''),
  specific_tipo_aposentadoria: Joi.string().max(255).optional().allow(null, ''),
  specific_numero_processo: Joi.string().max(255).optional().allow(null, ''),
});

exports.updateProjectValidator = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  description: Joi.string().max(1000).optional().allow(null, ''),
  client_id: Joi.number().integer().positive().optional(),
  contract_id: Joi.number().integer().positive().optional().allow(null),
  start_date: Joi.date().iso().optional(),
  deadline: Joi.date().iso().optional().allow(null),
  status: Joi.string().valid('planning', 'in_progress', 'on_hold', 'completed', 'cancelled').optional(),
  progress: Joi.number().integer().min(0).max(100).optional(),
  manager_id: Joi.number().integer().positive().optional(),
  
  // Campos específicos de requerimento para atualização
  type_requirement: Joi.string().valid('Salário Maternidade', 'BPC Loas', 'Aposentadoria').optional().allow(null, ''),
  specific_ocupacao: Joi.string().max(255).optional().allow(null, ''),
  specific_filho_ano: Joi.string().max(50).optional().allow(null, ''),
  specific_honorarios: Joi.number().optional().allow(null),
  specific_vara_do_processo: Joi.string().max(255).optional().allow(null, ''),
  specific_tipo_de_deficiencia: Joi.string().max(255).optional().allow(null, ''),
  specific_data_pericia: Joi.date().iso().optional().allow(null, ''),
  specific_data_pericia_social: Joi.date().iso().optional().allow(null, ''),
  specific_tipo_aposentadoria: Joi.string().max(255).optional().allow(null, ''),
  specific_numero_processo: Joi.string().max(255).optional().allow(null, ''),
});
