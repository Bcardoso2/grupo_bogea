// server/src/models/Project.js
const { pool } = require('../config/database');

class Project {
  // ... (create, findById)

  static async findAll(filters = {}) {
    try {
      let baseQuery = `
        SELECT p.*,
               c.name as client_name,
               ct.title as contract_title,
               u.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN contracts ct ON p.contract_id = ct.id
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE 1=1
      `;
      const queryConditions = [];
      const queryParams = [];

      if (filters.client_id !== undefined && !isNaN(filters.client_id)) {
        queryConditions.push(`p.client_id = ?`);
        queryParams.push(filters.client_id);
      }
      if (filters.status !== undefined && filters.status !== '') {
        queryConditions.push(`p.status = ?`);
        queryParams.push(filters.status);
      }
      if (filters.manager_id !== undefined && !isNaN(filters.manager_id)) {
        queryConditions.push(`p.manager_id = ?`);
        queryParams.push(filters.manager_id);
      }
      if (filters.search !== undefined && filters.search !== '') {
        queryConditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (queryConditions.length > 0) {
        baseQuery += ` AND ` + queryConditions.join(' AND ');
      }

      baseQuery += ` ORDER BY p.created_at DESC`;

      // Paginação - MUDANÇA CRÍTICA AQUI
      const finalLimit = filters.limit ? parseInt(filters.limit, 10) : 10;
      const finalOffset = (filters.page ? parseInt(filters.page, 10) - 1 : 0) * finalLimit;

      // CONCATENA LIMIT E OFFSET DIRETAMENTE NA STRING DA QUERY
      baseQuery += ` LIMIT ${finalLimit} OFFSET ${finalOffset}`; // <--- MUDANÇA AQUI: SEM PLACEHOLDERS `?`

      // Não adicione finalLimit e finalOffset ao queryParams aqui, pois eles foram concatenados diretamente
      // queryParams.push(finalLimit, finalOffset); // <--- REMOVA ESSA LINHA SE ESTIVER NO SEU CÓDIGO

      console.log('DEBUG SQL - findAll Query:', baseQuery);
      console.log('DEBUG SQL - findAll Params:', queryParams); // Os parâmetros de paginação NÃO estarão aqui agora
      console.log('DEBUG SQL - findAll Param Types:', queryParams.map(p => typeof p));

      const [rows] = await pool.execute(baseQuery, queryParams); // pool.execute só receberá parâmetros para filtros opcionais agora
      return rows;
    } catch (error) {
      console.error('Erro no Project.findAll:', error);
      throw error;
    }
  }

  // ... (update, delete)

  static async count(filters = {}) {
    try {
      let baseQuery = `SELECT COUNT(*) as total FROM projects WHERE 1=1`;
      const queryConditions = [];
      const queryParams = [];

      if (filters.client_id !== undefined && !isNaN(filters.client_id)) {
        queryConditions.push(`client_id = ?`);
        queryParams.push(filters.client_id);
      }
      if (filters.status !== undefined && filters.status !== '') {
        queryConditions.push(`status = ?`);
        queryParams.push(filters.status);
      }
      if (filters.manager_id !== undefined && !isNaN(filters.manager_id)) {
        queryConditions.push(`manager_id = ?`);
        queryParams.push(filters.manager_id);
      }
      if (filters.search !== undefined && filters.search !== '') {
        queryConditions.push(`(name LIKE ? OR description LIKE ?)`);
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (queryConditions.length > 0) {
        baseQuery += ` AND ` + queryConditions.join(' AND ');
      }

      console.log('DEBUG SQL - count Query:', baseQuery);
      console.log('DEBUG SQL - count Params:', queryParams);
      console.log('DEBUG SQL - count Param Types:', queryParams.map(p => typeof p));

      const [rows] = await pool.execute(baseQuery, queryParams);
      return rows[0].total;
    } catch (error) {
      console.error('Erro no Project.count:', error);
      throw error;
    }
  }

  // ... (updateProgress)
}

module.exports = Project;
