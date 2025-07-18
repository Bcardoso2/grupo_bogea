// server/src/controllers/projectController.js
const Project = require('../models/Project');
const ProjectTask = require('../models/ProjectTask'); // Adicionado ProjectTask para as rotas de tarefa
const { success, error, created, notFound, unauthorized } = require('../utils/responseHelper'); // Adicionado unauthorized
const asyncHandler = require('../utils/asyncHandler');
// Não é necessário importar 'jwt' ou 'generateToken' aqui, pois não são usados neste controller

exports.getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, client_id, manager_id } = req.query;

  const filters = {
    page: parseInt(page),
    limit: parseInt(limit),
    // Converte strings vazias para undefined, para que o modelo possa ignorá-las
    search: search === '' ? undefined : search,
    status: status === '' ? undefined : status,
    // Converte para inteiro se existir e não for vazio, caso contrário, undefined.
    // Usamos 'undefined' para que o modelo saiba ignorar o filtro
    client_id: client_id === '' ? undefined : (client_id ? parseInt(client_id) : undefined),
    manager_id: manager_id === '' ? undefined : (manager_id ? parseInt(manager_id) : undefined)
  };

  const projects = await Project.findAll(filters);
  const total = await Project.count(filters);

  success(res, {
    projects,
    pagination: {
      page: filters.page, // Use o valor já parseado
      limit: filters.limit, // Use o valor já parseado
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
  // Adicionado 'progress: 0' como default aqui também, para maior robustez
  const { name, description, client_id, contract_id, start_date, deadline, status = 'planning', progress = 0, manager_id } = req.body;

  // Validações básicas (opcional, mas recomendado)
  if (!name || !client_id || !manager_id || !start_date) {
    return error(res, 'Nome, Cliente, Responsável e Data de Início são obrigatórios.', 400);
  }

  const project = await Project.create({
    name,
    description,
    client_id,
    contract_id,
    start_date,
    deadline,
    status,
    progress,
    manager_id
  });

  created(res, project, 'Projeto criado com sucesso');
});

exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, contract_id, start_date, deadline, status, progress, manager_id } = req.body;

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    return notFound(res, 'Projeto não encontrado');
  }

  const updatedProject = await Project.update(id, {
    name,
    description,
    // Garante que contract_id é tratado corretamente se for opcional e vier como null/undefined/''
    contract_id: contract_id === '' ? undefined : contract_id, // Para DBs que preferem null ao invés de vazio
    start_date,
    deadline,
    status,
    progress,
    manager_id
  });

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
  // A função findByProject do modelo ProjectTask precisa saber lidar com esses filtros
  const tasks = await ProjectTask.findByProject(id, filters); // ID do projeto é o primeiro argumento

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
    project_id: id, // Certifique-se que o modelo ProjectTask.create espera project_id aqui
    title,
    description,
    status,
    priority,
    assigned_to, // O frontend enviará o ID do usuário (number)
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
