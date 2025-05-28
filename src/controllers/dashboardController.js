 
// server/src/controllers/dashboardController.js
const { pool } = require('../config/database');
const { success } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Estatísticas básicas
    const [clientsCount] = await pool.execute('SELECT COUNT(*) as count FROM clients WHERE status = "active"');
    const [documentsCount] = await pool.execute('SELECT COUNT(*) as count FROM documents WHERE status = "active"');
    const [contractsCount] = await pool.execute('SELECT COUNT(*) as count FROM contracts WHERE status IN ("active", "pending")');
    const [projectsCount] = await pool.execute('SELECT COUNT(*) as count FROM projects WHERE status IN ("planning", "in_progress")');
    
    // Contratos vencendo nos próximos 30 dias
    const [expiringContracts] = await pool.execute(`
      SELECT COUNT(*) as count FROM contracts 
      WHERE end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND status = 'active'
    `);
    
    // Projetos por status
    const [projectsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status
    `);
    
    // Documentos por categoria
    const [documentsByCategory] = await pool.execute(`
      SELECT category, COUNT(*) as count 
      FROM documents 
      WHERE status = 'active'
      GROUP BY category
    `);
    
    // Atividades recentes (últimos 10 documentos)
    const [recentDocuments] = await pool.execute(`
      SELECT d.title, d.created_at, c.name as client_name, u.name as uploaded_by
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      ORDER BY d.created_at DESC
      LIMIT 10
    `);
    
    // Tarefas em atraso
    const [overdueTasks] = await pool.execute(`
      SELECT COUNT(*) as count FROM project_tasks 
      WHERE due_date < CURDATE() AND status != 'completed'
    `);
    
    const stats = {
      summary: {
        clients: clientsCount[0].count,
        documents: documentsCount[0].count,
        contracts: contractsCount[0].count,
        projects: projectsCount[0].count,
        expiringContracts: expiringContracts[0].count,
        overdueTasks: overdueTasks[0].count
      },
      charts: {
        projectsByStatus: projectsByStatus,
        documentsByCategory: documentsByCategory
      },
      recentActivity: recentDocuments
    };
    
    success(res, stats);
  } catch (error) {
    throw error;
  }
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  const [activities] = await pool.execute(`
    SELECT 
      'document' as type,
      d.title as title,
      d.created_at,
      c.name as client_name,
      u.name as user_name
    FROM documents d
    LEFT JOIN clients c ON d.client_id = c.id
    LEFT JOIN users u ON d.uploaded_by = u.id
    
    UNION ALL
    
    SELECT 
      'contract' as type,
      ct.title as title,
      ct.created_at,
      cl.name as client_name,
      u.name as user_name
    FROM contracts ct
    LEFT JOIN clients cl ON ct.client_id = cl.id
    LEFT JOIN users u ON ct.responsible_id = u.id
    
    UNION ALL
    
    SELECT 
      'project' as type,
      p.name as title,
      p.created_at,
      c.name as client_name,
      u.name as user_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN users u ON p.manager_id = u.id
    
    ORDER BY created_at DESC
    LIMIT ?
  `, [parseInt(limit)]);
    
  success(res, activities);
});