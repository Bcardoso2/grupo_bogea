// server/src/controllers/projectController.js
const Project = require('../models/Project');
const ProjectTask = require('../models/ProjectTask');
const { success, error, created, notFound } = require('../utils/responseHelper'); // Removi 'unauthorized' se não estiver sendo usado explicitamente
const asyncHandler = require('../utils/asyncHandler');

// Funções auxiliares (se existirem ou forem necessárias, como generateToken)
// const jwt = require('jsonwebtoken'); // Descomente se usar JWT diretamente aqui
// const generateToken = (payload) => { /* ... sua lógica de token ... */ };

exports.getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, client_id, manager_id } = req.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    // Converte strings vazias para undefined, para que o modelo possa ignorá-las
    search: search === '' ? undefined : search,
    status: status === '' ? undefined : status,
    // Converte para inteiro se existir e não for vazio, caso contrário, undefined.
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
  // Desestruture apenas os campos permitidos para criação.
  // 'progress' é inicializado no modelo, então não o receba do req.body.
  const { name, description, client_id, contract_id, start_date, deadline, status, manager_id, type_requirement, ...specificDetails } = req.body;

  // Validações básicas
  if (!name || !client_id || !manager_id || !start_date) {
    return error(res, 'Nome, Cliente, Responsável e Data de Início são obrigatórios.', 400);
  }

  const projectData = {
    name,
    description,
    client_id,
    contract_id, // Pode ser null ou undefined se não for obrigatório
    start_date,
    deadline,
    status: status || 'planning', // Garante um status padrão
    progress: 0, // Sempre inicia com 0 na criação
    manager_id,
    type_requirement: type_requirement || undefined, // Inclui o tipo de requerimento
  };

  const project = await Project.create(projectData);

  // TODO: Lógica para salvar campos específicos (specificDetails)
  // Se você tiver tabelas separadas para Salário Maternidade, BPC, Aposentadoria,
  // essa lógica deve ser implementada aqui, usando o `project.id` recém-criado.
  // Exemplo: if (type_requirement === 'Salário Maternidade') { await ProjectSalarioMaternidade.create({ projectId: project.id, ...specificDetails }); }

  created(res, project, 'Projeto criado com sucesso');
});

exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Receba todos os campos que podem ser atualizados
  const { name, description, contract_id, start_date, deadline, status, progress, manager_id, type_requirement, ...specificDetails } = req.body;

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    return notFound(res, 'Projeto não encontrado');
  }

  const updatedData = {
    name,
    description,
    contract_id: contract_id === '' ? null : contract_id, // Converte '' para null se seu DB preferir
    start_date,
    deadline,
    status,
    progress,
    manager_id,
    type_requirement: type_requirement || undefined,
  };

  const updatedProject = await Project.update(id, updatedData);

  // TODO: Lógica para atualizar campos específicos (specificDetails)
  // Similar à criação, mas para atualização.
  // Exemplo: if (type_requirement === 'Salário Maternidade') { await ProjectSalarioMaternidade.update(id, specificDetails); }

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

// Tarefas do projeto
exports.getProjectTasks = asyncHandler(async (req, res) => {
  const { id } = req.params; // project_id
  const { status, priority, assigned_to } = req.query;

  const project = await Project.findById(id);
  if (!project) {
    return notFound(res, 'Projeto não encontrado');
  }

  const filters = {
    status: status === '' ? undefined : status,
    priority: priority === '' ? undefined : priority,
    assigned_to: assigned_to === '' ? undefined : (assigned_to ? parseInt(assigned_to) : undefined)
  };
  const tasks = await ProjectTask.findByProject(id, filters);

  success(res, tasks);
});

exports.createProjectTask = asyncHandler(async (req, res) => {
  const { id } = req.params; // project_id
  const { title, description, status = 'to_do', priority = 'medium', assigned_to, start_date, due_date } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    return notFound(res, 'Projeto não encontrado');
  }

  // Validações básicas para tarefa
  if (!title) {
    return error(res, 'Título da tarefa é obrigatório.', 400);
  }

  const task = await ProjectTask.create({
    project_id: id,
    title,
    description,
    status,
    priority,
    assigned_to,
    start_date,
    due_date
  });

  created(res, task, 'Tarefa criada com sucesso');
});

exports.updateProjectTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, assigned_to, start_date, due_date } = req.body;

  const existingTask = await ProjectTask.findById(taskId);
  if (!existingTask) {
    return notFound(res, 'Tarefa não encontrada');
  }

  const updatedTask = await ProjectTask.update(taskId, {
    title,
    description,
    status,
    priority,
    assigned_to,
    start_date,
    due_date
  });

  success(res, updatedTask, 'Tarefa atualizada com sucesso');
});

exports.deleteProjectTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await ProjectTask.findById(taskId);
  if (!task) {
    return notFound(res, 'Tarefa não encontrada');
  }

  await ProjectTask.delete(taskId);

  success(res, null, 'Tarefa excluída com sucesso');
});
