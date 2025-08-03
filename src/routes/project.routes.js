// server/src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const ProjectModel = require('../models/Project');

const projectControllerModule = require('../controllers/projectController'); // <-- Mude para esta forma de importação

console.log('DEBUG_ROUTES: projectControllerModule:', projectControllerModule); // <-- LOG CRÍTICO

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
} = projectControllerModule; // <-- A desestruturação agora é feita a partir do módulo completo

// Restante do arquivo permanece o mesmo
// ...

// Certifique-se que o middleware de autenticação está AQUI, DEPOIS da rota de debug
router.use(authMiddleware);

router.get('/', getProjects); // <--- A linha que causa o erro
// ...
module.exports = router;
