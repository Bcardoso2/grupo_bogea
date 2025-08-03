// server/src/models/ProjectBPC.js
const { pool } = require('../config/database');

class ProjectBPC {
  static async create(projectId, details) {
    try {
      const { tipo_de_deficiencia, data_pericia, data_pericia_social } = details;
      const query = `
        INSERT INTO project_bpc_details 
        (project_id, tipo_de_deficiencia, data_pericia, data_pericia_social)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        projectId,
        tipo_de_deficiencia || null,
        data_pericia || null,
        data_pericia_social || null,
      ]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM project_bpc_details WHERE project_id = ?',
        [projectId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(projectId, details) {
    try {
      const { tipo_de_deficiencia, data_pericia, data_pericia_social } = details;
      const query = `
        UPDATE project_bpc_details 
        SET tipo_de_deficiencia = ?, data_pericia = ?, data_pericia_social = ?
        WHERE project_id = ?
      `;
      const [result] = await pool.execute(query, [
        tipo_de_deficiencia || null,
        data_pericia || null,
        data_pericia_social || null,
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
        'DELETE FROM project_bpc_details WHERE project_id = ?',
        [projectId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectBPC;
