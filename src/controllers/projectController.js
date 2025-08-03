// server/src/controllers/projectController.js
const Project = require('../models/Project');
const ProjectTask = require('../models/ProjectTask');
const { success, error, created, notFound } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

exports.getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, client_id, manager_id } = req.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search === '' ? undefined : search,
    status: status === '' ? undefined : status,
    client_id: client_id === '' ? undefined : (client_id ? parseInt(client_id) : undefined),
    manager_id: manager_id === '' ? undefined : (manager_id ? parseInt(manager_id) : undefined)
  };

  const projects = await Project.findAll(filters);
  const total = await Project.count(filters);

  success(res, {
    projects,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit)
    }
  });
});

exports.getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    return notFound(res, 'Projeto não encontrado');
  }

  success(res, project);
});

exports.createProject = asyncHandler(async (req, res) => {
  // Desestruture todos os campos que vêm do frontend, incluindo os específicos
  const { 
    name, description, client_id, contract_id, start_date, deadline, status, manager_id, type_requirement, 
    specific_ocupacao, specific_filho_ano, specific_honorarios, specific_vara_do_processo,
    specific_tipo_de_deficiencia, specific_data_pericia, specific_data_pericia_social,
    specific_tipo_aposentadoria, specific_numero_processo 
  } = req.body;

  if (!name || !client_id || !manager_id || !start_date) {
    return error(res, 'Nome, Cliente, Responsável e Data de Início são obrigatórios.', 400);
  }

  // Crie o objeto `specificDetails` com os nomes de coluna do banco de dados
  const specificDetails = {
    ocupacao: specific_ocupacao,
    filho_ano: specific_filho_ano,
    honorarios: specific_honorarios,
    vara_do_processo: specific_vara_do_processo,
    tipo_de_deficiencia: specific_tipo_de_deficiencia,
    data_pericia: specific_data_pericia,
    data_pericia_social: specific_data_pericia_social,
    tipo_aposentadoria: specific_tipo_aposentadoria,
    numero_processo: specific_numero_processo,
  };

  const projectData = {
    name,
    description,
    client_id,
    contract_id,
    start_date,
    deadline,
    status: status || 'planning',
    progress: 0,
    manager_id,
    type_requirement,
    specificDetails, // Passe o objeto mapeado para o modelo
  };

  const project = await Project.create(projectData);

  created(res, project, 'Projeto criado com sucesso');
});

exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id, type_requirement,
    specific_ocupacao, specific_filho_ano, specific_honorarios, specific_vara_do_processo,
    specific_tipo_de_deficiencia, specific_data_pericia, specific_data_pericia_social,
    specific_tipo_aposentadoria, specific_numero_processo 
  } = req.body;

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    return notFound(res, 'Projeto não encontrado');
  }

  const specificDetails = {
    ocupacao: specific_ocupacao,
    filho_ano: specific_filho_ano,
    honorarios: specific_honorarios,
    vara_do_processo: specific_vara_do_processo,
    tipo_de_deficiencia: specific_tipo_de_deficiencia,
    data_pericia: specific_data_pericia,
    data_pericia_social: specific_data_pericia_social,
    tipo_aposentadoria: specific_tipo_aposentadoria,
    numero_processo: specific_numero_processo,
  };

  const updatedData = {
    name,
    description,
    client_id,
    contract_id: contract_id === '' ? null : contract_id,
    start_date,
    deadline,
    status,
    progress,
    manager_id,
    type_requirement,
    specificDetails, // Passe o objeto mapeado para o modelo
  };

  const updatedProject = await Project.update(id, updatedData);

  success(res, updatedProject, 'Projeto atualizado com sucesso');
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    return notFound(res, 'Projeto não encontrado');
  }

  await Project.delete(id);

  success(res, null, 'Projeto excluído com sucesso');
});

// ... (Restante do controller)
