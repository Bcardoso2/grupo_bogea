 
// server/src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask
} = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createProjectValidator, updateProjectValidator } = require('../validators/projectValidator');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', validate(createProjectValidator), createProject);
router.put('/:id', validate(updateProjectValidator), updateProject);
router.delete('/:id', deleteProject);

// Rotas de tarefas
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createProjectTask);
router.put('/:id/tasks/:taskId', updateProjectTask);
router.delete('/:id/tasks/:taskId', deleteProjectTask);

module.exports = router;
