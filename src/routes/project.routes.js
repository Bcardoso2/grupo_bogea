// server/src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // Importe o pool aqui!

const {
  getProjects,
  getProject, // getProject é para /:id
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

// --- PONTO CRÍTICO: COLOQUE A ROTA DE DEBUG AQUI (ANTES DE QUALQUER :ID OU router.use) ---
router.get('/debug-projects', authMiddleware, async (req, res) => { // Protegido por authMiddleware
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

    // Importe o modelo DENTRO da rota ou no topo do arquivo se não estiver lá
    const ProjectModel = require('../models/Project'); 
    const projects = await ProjectModel.findAll(testFilters); // Chamada correta para findAll
    const total = await ProjectModel.count(testFilters); // Chamada correta para count

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
// --- FIM DA ROTA DE DEBUG ---


// Agora, suas rotas normais.
// Se você tem um `router.use(authMiddleware)` no topo, mantenha-o.
// Se não, adicione authMiddleware individualmente.
router.use(authMiddleware); // Se estiver aqui, todas as rotas abaixo serão protegidas.

// Rotas de projetos normais
router.get('/', getProjects); // Rota para listar todos os projetos
router.get('/:id', getProject); // Rota para buscar um projeto por ID (a que estava dando "Projeto não encontrado")
router.post('/', validate(createProjectValidator), createProject);
router.put('/:id', validate(updateProjectValidator), updateProject);
router.delete('/:id', deleteProject);

// Rotas de tarefas
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createProjectTask);
router.put('/:id/tasks/:taskId', updateProjectTask);
router.delete('/:id/tasks/:taskId', deleteProjectTask);

module.exports = router;
