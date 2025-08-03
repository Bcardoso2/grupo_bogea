// server/src/controllers/projectController.js
const Project = require('../models/Project');
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
  const { name, description, client_id, contract_id, start_date, deadline, status, manager_id, type_requirement, ...specificDetails } = req.body;

  if (!name || !client_id || !manager_id || !start_date) {
    return error(res, 'Nome, Cliente, Responsável e Data de Início são obrigatórios.', 400);
  }

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
    specificDetails,
  };

  const project = await Project.create(projectData);

  created(res, project, 'Projeto criado com sucesso');
});

exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id, type_requirement, ...specificDetails } = req.body;

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    return notFound(res, 'Projeto não encontrado');
  }

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
    specificDetails,
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

exports.getProjectTasks = asyncHandler(async (req, res) => {
  const { id } = req.params;
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
  const { id } = req.params;
  const { title, description, status = 'to_do', priority = 'medium', assigned_to, start_date, due_date } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    return notFound(res, 'Projeto não encontrado');
  }

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
