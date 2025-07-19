// server/src/routes/project.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database'); // <--- ESSA LINHA É CRUCIAL PARA O TESTE

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

// --- NOVO ENDPOINT DE TESTE TEMPORÁRIO (DEVE ESTAR AQUI) ---
router.get('/test-db-query', async (req, res) => {
  try {
    const testQuery = 'SELECT 1 + 1 AS solution';
    const [rows] = await pool.execute(testQuery); // <--- 'pool' precisa estar definido aqui
    console.log('TESTE DB: Query simples executada:', rows);
    res.json({ success: true, message: 'Teste de query simples OK', data: rows[0] });
  } catch (error) {
    console.error('TESTE DB: ERRO NA QUERY SIMPLES:', error);
    res.status(500).json({ success: false, message: 'Erro no teste de query simples', error: error.message });
  }
});
// --- FIM DO NOVO ENDPOINT DE TESTE TEMPORÁRIO ---

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
