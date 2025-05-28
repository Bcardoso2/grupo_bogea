const { pool } = require('../config/database');

class Client {
  // Criar novo cliente
  static async create({ name, email, phone, cnpj, address, contact_person, notes, created_by }) {
    try {
      const query = `
        INSERT INTO clients (name, email, phone, cnpj, address, contact_person, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        name, email, phone, cnpj, address, contact_person, notes, created_by
      ]);

      return {
        id: result.insertId,
        name,
        email,
        phone,
        cnpj,
        address,
        contact_person,
        notes,
        created_by
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  // Buscar cliente por ID
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, u.name as created_by_name
        FROM clients c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar cliente por ID:', error);
      throw error;
    }
  }

  // Listar clientes com filtros e paginação
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT c.*, u.name as created_by_name
        FROM clients c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      // Filtros
      if (filters.search) {
        query += `
          AND (
            c.name LIKE ? OR
            c.email LIKE ? OR
            c.cnpj LIKE ? OR
            c.contact_person LIKE ?
          )
        `;
        const term = `%${filters.search}%`;
        params.push(term, term, term, term);
      }

      if (filters.status) {
        query += ` AND c.status = ?`;
        params.push(filters.status);
      }

      query += ` ORDER BY c.name`;

      // Paginação - concatenação segura
      if (filters.page && filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = (parseInt(filters.page) - 1) * limit;

        if (!isNaN(limit) && !isNaN(offset)) {
          query += ` LIMIT ${limit} OFFSET ${offset}`;
        }
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw error;
    }
  }

  // Contar total de clientes com filtros
  static async count(filters = {}) {
    try {
      let query = `
        SELECT COUNT(*) as total
        FROM clients c
        WHERE 1=1
      `;
      const params = [];

      if (filters.search) {
        query += `
          AND (
            c.name LIKE ? OR
            c.email LIKE ? OR
            c.cnpj LIKE ? OR
            c.contact_person LIKE ?
          )
        `;
        const term = `%${filters.search}%`;
        params.push(term, term, term, term);
      }

      if (filters.status) {
        query += ` AND c.status = ?`;
        params.push(filters.status);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0].total;
    } catch (error) {
      console.error('Erro ao contar clientes:', error);
      throw error;
    }
  }

  // Atualizar cliente
  static async update(id, { name, email, phone, cnpj, address, contact_person, status, notes }) {
    try {
      const query = `
        UPDATE clients
        SET name = ?, email = ?, phone = ?, cnpj = ?, address = ?, contact_person = ?, status = ?, notes = ?
        WHERE id = ?
      `;
      await pool.execute(query, [
        name, email, phone, cnpj, address, contact_person, status, notes, id
      ]);

      return this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  // Excluir cliente
  static async delete(id) {
    try {
      const query = `DELETE FROM clients WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  }

  // Buscar documentos do cliente
  static async getDocuments(clientId) {
    try {
      const query = `
        SELECT d.*, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.client_id = ?
        ORDER BY d.created_at DESC
      `;
      const [rows] = await pool.execute(query, [clientId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar documentos do cliente:', error);
      throw error;
    }
  }

  // Buscar contratos do cliente
  static async getContracts(clientId) {
    try {
      const query = `
        SELECT c.*, u.name as responsible_name
        FROM contracts c
        LEFT JOIN users u ON c.responsible_id = u.id
        WHERE c.client_id = ?
        ORDER BY c.start_date DESC
      `;
      const [rows] = await pool.execute(query, [clientId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar contratos do cliente:', error);
      throw error;
    }
  }

  // Buscar projetos do cliente
  static async getProjects(clientId) {
    try {
      const query = `
        SELECT p.*, u.name as manager_name
        FROM projects p
        LEFT JOIN users u ON p.manager_id = u.id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `;
      const [rows] = await pool.execute(query, [clientId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar projetos do cliente:', error);
      throw error;
    }
  }
}

module.exports = Client;
