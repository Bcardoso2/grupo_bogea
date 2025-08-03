// server/src/models/ProjectSalarioMaternidade.js
const { pool } = require('../config/database');

class ProjectSalarioMaternidade {
  static async create(projectId, details) {
    try {
      const { ocupacao, filho_ano, honorarios, vara_do_processo } = details;
      const query = `
        INSERT INTO project_salario_maternidade_details 
        (project_id, ocupacao, filho_ano, honorarios, vara_do_processo)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        projectId,
        ocupacao || null,
        filho_ano || null,
        honorarios || null,
        vara_do_processo || null,
      ]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM project_salario_maternidade_details WHERE project_id = ?',
        [projectId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(projectId, details) {
    try {
      const { ocupacao, filho_ano, honorarios, vara_do_processo } = details;
      const query = `
        UPDATE project_salario_maternidade_details 
        SET ocupacao = ?, filho_ano = ?, honorarios = ?, vara_do_processo = ?
        WHERE project_id = ?
      `;
      const [result] = await pool.execute(query, [
        ocupacao || null,
        filho_ano || null,
        honorarios || null,
        vara_do_processo || null,
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
        'DELETE FROM project_salario_maternidade_details WHERE project_id = ?',
        [projectId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectSalarioMaternidade;
