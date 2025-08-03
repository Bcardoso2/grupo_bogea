// server/src/models/Project.js
const { pool } = require('../config/database');
const ProjectSalarioMaternidade = require('./ProjectSalarioMaternidade');
const ProjectBPC = require('./ProjectBPC');
const ProjectAposentadoria = require('./ProjectAposentadoria');

class Project {
  static async create({ name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id, type_requirement, specificDetails }) {
    try {
      const query = `
        INSERT INTO projects
        (name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id, type_requirement)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const finalContractId = contract_id === undefined || contract_id === '' ? null : contract_id;

      const [result] = await pool.execute(query, [
        name, description, client_id, finalContractId, start_date, deadline, status, progress, manager_id, type_requirement || null
      ]);

      const projectId = result.insertId;

      // Se houver detalhes específicos, chame o modelo correto para criá-los
      if (projectId && type_requirement && specificDetails) {
        switch (type_requirement) {
          case 'Salário Maternidade':
            await ProjectSalarioMaternidade.create(projectId, specificDetails);
            break;
          case 'BPC Loas':
            await ProjectBPC.create(projectId, specificDetails);
            break;
          case 'Aposentadoria':
            await ProjectAposentadoria.create(projectId, specificDetails);
            break;
        }
      }

      return this.findById(projectId); // Retorna o projeto completo, incluindo os detalhes recém-criados
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
      const project = rows[0] || null;

      if (project) {
        let specificDetails = null;
        switch (project.type_requirement) {
          case 'Salário Maternidade':
            specificDetails = await ProjectSalarioMaternidade.findByProjectId(project.id);
            break;
          case 'BPC Loas':
            specificDetails = await ProjectBPC.findByProjectId(project.id);
            break;
          case 'Aposentadoria':
            specificDetails = await ProjectAposentadoria.findByProjectId(project.id);
            break;
        }
        // Retorne o projeto com os detalhes específicos anexados
        return { ...project, ...specificDetails };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
  
  // O resto dos métodos (findAll, update, delete, count, updateProgress) do Project.js
  // Você já os tem na última versão, então não precisam ser repetidos aqui.
  // Eles já contêm a lógica de paginação e filtros que resolveu o problema anterior.
  // Lembre-se apenas de ajustar o `update` para que ele também atualize os detalhes específicos.
  
  static async update(id, { name, description, client_id, contract_id, start_date, deadline, status, progress, manager_id, type_requirement, specificDetails }) {
    try {
      const query = `
        UPDATE projects
        SET name = ?, description = ?, client_id = ?, contract_id = ?, start_date = ?, deadline = ?,
            status = ?, progress = ?, manager_id = ?, type_requirement = ?
        WHERE id = ?
      `;

      const finalContractId = contract_id === undefined || contract_id === '' ? null : contract_id;

      await pool.execute(query, [
        name, description, client_id, finalContractId, start_date, deadline, status, progress, manager_id, type_requirement || null, id
      ]);

      // Lógica para atualizar ou criar os detalhes específicos
      if (type_requirement && specificDetails) {
        let existingDetails;
        switch (type_requirement) {
          case 'Salário Maternidade':
            existingDetails = await ProjectSalarioMaternidade.findByProjectId(id);
            if (existingDetails) {
              await ProjectSalarioMaternidade.update(id, specificDetails);
            } else {
              await ProjectSalarioMaternidade.create(id, specificDetails);
            }
            break;
          case 'BPC Loas':
            existingDetails = await ProjectBPC.findByProjectId(id);
            if (existingDetails) {
              await ProjectBPC.update(id, specificDetails);
            } else {
              await ProjectBPC.create(id, specificDetails);
            }
            break;
          case 'Aposentadoria':
            existingDetails = await ProjectAposentadoria.findByProjectId(id);
            if (existingDetails) {
              await ProjectAposentadoria.update(id, specificDetails);
            } else {
              await ProjectAposentadoria.create(id, specificDetails);
            }
            break;
        }
      } else if (type_requirement === null || type_requirement === undefined || type_requirement === '') {
        // Se o tipo de requerimento for removido ou não especificado, delete os detalhes existentes
        await ProjectSalarioMaternidade.deleteByProjectId(id);
        await ProjectBPC.deleteByProjectId(id);
        await ProjectAposentadoria.deleteByProjectId(id);
      }

      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let baseQuery = `
        SELECT p.*,
               c.name as client_name,
               u.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
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

      baseQuery += ` LIMIT ${finalLimit} OFFSET ${finalOffset}`;

      const [rows] = await pool.execute(baseQuery, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Como você tem ON DELETE CASCADE, a exclusão dos detalhes é automática.
      // Apenas exclua o projeto principal.
      await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
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

      const [rows] = await pool.execute(baseQuery, queryParams);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
