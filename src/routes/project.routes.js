// server/src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const ProjectModel = require('../models/Project'); // Importado para o teste de debug.

const projectControllerModule = require('../controllers/projectController'); // <-- IMPORTAÇÃO DO MÓDULO COMPLETO

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
} = projectControllerModule; // <-- DESESTRUTURAÇÃO A PARTIR DO MÓDULO COMPLETO

const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createProjectValidator, updateProjectValidator } = require('../validators/projectValidator');

// --- NOVO ENDPOINT DE TESTE DETALHADO ---
// Esta rota não será afetada pelo erro da desestruturação abaixo e nos ajudará a ver os logs.
router.get('/debug-projects', authMiddleware, async (req, res) => {
  try {
    const testFilters = {
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
      client_id: undefined,
      manager_id: undefined
    };

    console.log('DEBUG_TEST: Filters sent to Project.findAll:', testFilters);

    const projects = await ProjectModel.findAll(testFilters);
    const total = await ProjectModel.count(testFilters);

    console.log('DEBUG_TEST: Projects found:', projects.length);
    res.json({
      success: true,
      message: 'Debug query OK',
      data: {
        projects,
        pagination: {
          page: testFilters.page,
          limit: testFilters.limit,
          total,
          pages: Math.ceil(total / testFilters.limit)
        }
      }
    });
  } catch (error) {
    console.error('DEBUG_TEST: ERRO NA QUERY DE DEBUG:', error);
    res.status(500).json({ success: false, message: 'Erro na query de debug', error: error.message });
  }
});
// --- FIM DO NOVO ENDPOINT DE TESTE DETALHADO ---

router.use(authMiddleware);

// --- Rotas principais, que estão causando o erro ---
// A desestruturação falhou, então getProjects está 'undefined', causando o erro
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
