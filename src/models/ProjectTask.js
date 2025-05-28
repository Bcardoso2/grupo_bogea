 
// server/src/models/ProjectTask.js
const { pool } = require('../config/database');

class ProjectTask {
  static async create({ project_id, title, description, status, priority, assigned_to, start_date, due_date }) {
    try {
      const query = `
        INSERT INTO project_tasks 
        (project_id, title, description, status, priority, assigned_to, start_date, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        project_id, title, description, status, priority, assigned_to, start_date, due_date
      ]);
      
      return {
        id: result.insertId,
        project_id,
        title,
        description,
        status,
        priority,
        assigned_to,
        start_date,
        due_date
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const query = `
        SELECT t.*, 
               u.name as assigned_to_name,
               p.name as project_name
        FROM project_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE t.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByProject(projectId, filters = {}) {
    try {
      let query = `
        SELECT t.*, 
               u.name as assigned_to_name
        FROM project_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id = ?
      `;
      
      const params = [projectId];
      
      if (filters.status) {
        query += ` AND t.status = ?`;
        params.push(filters.status);
      }
      
      if (filters.priority) {
        query += ` AND t.priority = ?`;
        params.push(filters.priority);
      }
      
      if (filters.assigned_to) {
        query += ` AND t.assigned_to = ?`;
        params.push(filters.assigned_to);
      }
      
      query += ` ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END, t.due_date ASC
      `;
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, { title, description, status, priority, assigned_to, start_date, due_date }) {
    try {
      const completedAt = status === 'completed' ? new Date() : null;
      
      const query = `
        UPDATE project_tasks
        SET title = ?, description = ?, status = ?, priority = ?, 
            assigned_to = ?, start_date = ?, due_date = ?, completed_at = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        title, description, status, priority, assigned_to, start_date, due_date, completedAt, id
      ]);
      
      // Atualizar progresso do projeto
      const task = await this.findById(id);
      if (task) {
        const Project = require('./Project');
        await Project.updateProgress(task.project_id);
      }
      
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      // Obter projeto_id antes de deletar
      const task = await this.findById(id);
      const projectId = task?.project_id;
      
      const query = `DELETE FROM project_tasks WHERE id = ?`;
      await pool.execute(query, [id]);
      
      // Atualizar progresso do projeto
      if (projectId) {
        const Project = require('./Project');
        await Project.updateProgress(projectId);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getOverdueTasks() {
    try {
      const query = `
        SELECT t.*, 
               u.name as assigned_to_name,
               p.name as project_name,
               c.name as client_name
        FROM project_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE t.due_date < CURDATE() 
        AND t.status != 'completed'
        ORDER BY t.due_date ASC
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectTask;