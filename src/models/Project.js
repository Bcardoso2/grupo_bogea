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

      const [result] = await pool.execute(query, [
        name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id
      ]);

      return {
        id: result.insertId,
        name,
        description,
        client_id,
        contract_id,
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
      let query = `
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

      const params = [];

      // --- INÍCIO DAS MUDANÇAS AQUI ---
      // Para IDs (client_id, manager_id), verificamos se é um número válido (não NaN)
      // e também se não é undefined.
      if (filters.client_id !== undefined && !isNaN(filters.client_id)) {
        query += ` AND p.client_id = ?`;
        params.push(filters.client_id);
      }

      if (filters.status !== undefined && filters.status !== '') { // Verifica undefined E string vazia
        query += ` AND p.status = ?`;
        params.push(filters.status);
      }

      if (filters.manager_id !== undefined && !isNaN(filters.manager_id)) {
        query += ` AND p.manager_id = ?`;
        params.push(filters.manager_id);
      }

      // Para 'search', que usa 2 placeholders, adicione 2 parâmetros.
      if (filters.search !== undefined && filters.search !== '') {
        query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
        params.push(`%${filters.search}%`); // Primeiro parâmetro para p.name
        params.push(`%${filters.search}%`); // Segundo parâmetro para p.description
      }
      // --- FIM DAS MUDANÇAS AQUI ---

      query += ` ORDER BY p.created_at DESC`;

      if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(Number(filters.limit), Number(offset));
      }

      console.log('DEBUG SQL - findAll Query:', query); // Para depuração
      console.log('DEBUG SQL - findAll Params:', params); // Para depuração

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
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

      await pool.execute(query, [
        name, description, contract_id, start_date, deadline, status, progress, manager_id, id
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
      let query = `SELECT COUNT(*) as total FROM projects WHERE 1=1`;
      const params = [];

      // --- INÍCIO DAS MUDANÇAS AQUI (igual a findAll) ---
      if (filters.client_id !== undefined && !isNaN(filters.client_id)) {
        query += ` AND client_id = ?`;
        params.push(filters.client_id);
      }

      if (filters.status !== undefined && filters.status !== '') {
        query += ` AND status = ?`;
        params.push(filters.status);
      }

      if (filters.manager_id !== undefined && !isNaN(filters.manager_id)) {
        query += ` AND manager_id = ?`;
        params.push(filters.manager_id);
      }

      if (filters.search !== undefined && filters.search !== '') {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${filters.search}%`);
        params.push(`%${filters.search}%`);
      }
      // --- FIM DAS MUDANÇAS AQUI ---

      console.log('DEBUG SQL - count Query:', query); // Para depuração
      console.log('DEBUG SQL - count Params:', params); // Para depuração

      const [rows] = await pool.execute(query, params);
      return rows[0].total;
    } catch (error) {
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
