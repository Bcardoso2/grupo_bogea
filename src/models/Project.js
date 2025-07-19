// server/src/models/Project.js
const { pool } = require('../config/database');

class Project {
  static async create({ name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id }) {
    try {
      const query = `
        INSERT INTO projects
        (name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const finalContractId = contract_id === undefined || contract_id === '' ? null : contract_id;

      const [result] = await pool.execute(query, [
        name, description, client_id, finalContractId, start_date, deadline, status, progress, manager_id
      ]);

      return {
        id: result.insertId,
        name,
        description,
        client_id,
        contract_id: finalContractId,
        start_date,
        deadline,
        status,
        progress,
        manager_id
      };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT p.*,
               c.name as client_name,
               ct.title as contract_title,
               u.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN contracts ct ON p.contract_id = ct.id
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.id = ?
      `;

      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

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

      const finalLimit = filters.limit ? parseInt(filters.limit, 10) : 10;
      const finalOffset = (filters.page ? parseInt(filters.page, 10) - 1 : 0) * finalLimit;

      baseQuery += ` LIMIT ? OFFSET ?`;
      queryParams.push(finalLimit, finalOffset);

      console.log('DEBUG SQL - findAll Query:', baseQuery);
      console.log('DEBUG SQL - findAll Params:', queryParams);
      console.log('DEBUG SQL - findAll Param Types:', queryParams.map(p => typeof p)); // Loga o tipo de cada parâmetro

      const [rows] = await pool.execute(baseQuery, queryParams);
      return rows;
    } catch (error) {
      console.error('Erro no Project.findAll:', error);
      throw error;
    }
  }

  static async update(id, { name, description, contract_id, start_date, deadline, status, progress, manager_id }) {
    try {
      const query = `
        UPDATE projects
        SET name = ?, description = ?, contract_id = ?, start_date = ?, deadline = ?,
            status = ?, progress = ?, manager_id = ?
        WHERE id = ?
      `;

      const finalContractId = contract_id === undefined || contract_id === '' ? null : contract_id;

      await pool.execute(query, [
        name, description, finalContractId, start_date, deadline, status, progress, manager_id, id
      ]);

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = `DELETE FROM projects WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

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
      console.log('DEBUG SQL - count Param Types:', queryParams.map(p => typeof p)); // Loga o tipo de cada parâmetro

      const [rows] = await pool.execute(baseQuery, queryParams);
      return rows[0].total;
    } catch (error) {
      console.error('Erro no Project.count:', error);
      throw error;
    }
  }

  static async updateProgress(projectId) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM project_tasks
        WHERE project_id = ?
      `;

      const [rows] = await pool.execute(query, [projectId]);
      const { total_tasks, completed_tasks } = rows[0];

      const progress = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

      const updateQuery = `UPDATE projects SET progress = ? WHERE id = ?`;
      await pool.execute(updateQuery, [progress, projectId]);

      return progress;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
