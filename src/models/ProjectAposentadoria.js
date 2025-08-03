// server/src/models/ProjectAposentadoria.js
const { pool } = require('../config/database');

class ProjectAposentadoria {
  static async create(projectId, details) {
    try {
      const { tipo_aposentadoria, numero_processo } = details;
      const query = `
        INSERT INTO project_aposentadoria_details 
        (project_id, tipo_aposentadoria, numero_processo)
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        projectId,
        tipo_aposentadoria || null,
        numero_processo || null,
      ]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM project_aposentadoria_details WHERE project_id = ?',
        [projectId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(projectId, details) {
    try {
      const { tipo_aposentadoria, numero_processo } = details;
      const query = `
        UPDATE project_aposentadoria_details 
        SET tipo_aposentadoria = ?, numero_processo = ?
        WHERE project_id = ?
      `;
      const [result] = await pool.execute(query, [
        tipo_aposentadoria || null,
        numero_processo || null,
        projectId,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async deleteByProjectId(projectId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM project_aposentadoria_details WHERE project_id = ?',
        [projectId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectAposentadoria;
