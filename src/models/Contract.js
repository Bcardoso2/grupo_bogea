 
// server/src/models/Contract.js
const { pool } = require('../config/database');

class Contract {
  static async create({ title, contract_number, client_id, start_date, end_date, value, status, document_id, description, responsible_id }) {
    try {
      const query = `
        INSERT INTO contracts 
        (title, contract_number, client_id, start_date, end_date, value, status, document_id, description, responsible_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        title, contract_number, client_id, start_date, end_date, value, status, document_id, description, responsible_id
      ]);
      
      return {
        id: result.insertId,
        title,
        contract_number,
        client_id,
        start_date,
        end_date,
        value,
        status,
        document_id,
        description,
        responsible_id
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const query = `
        SELECT c.*, 
               cl.name as client_name, 
               u.name as responsible_name,
               d.title as document_title
        FROM contracts c
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN users u ON c.responsible_id = u.id
        LEFT JOIN documents d ON c.document_id = d.id
        WHERE c.id = ?
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
        SELECT c.*, 
               cl.name as client_name, 
               u.name as responsible_name,
               d.title as document_title
        FROM contracts c
        LEFT JOIN clients cl ON c.client_id = cl.id
        LEFT JOIN users u ON c.responsible_id = u.id
        LEFT JOIN documents d ON c.document_id = d.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.client_id) {
        query += ` AND c.client_id = ?`;
        params.push(filters.client_id);
      }
      
      if (filters.status) {
        query += ` AND c.status = ?`;
        params.push(filters.status);
      }
      
      if (filters.responsible_id) {
        query += ` AND c.responsible_id = ?`;
        params.push(filters.responsible_id);
      }
      
      if (filters.search) {
        query += ` AND (c.title LIKE ? OR c.contract_number LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ` ORDER BY c.start_date DESC`;
      
      if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(Number(filters.limit), Number(offset));
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, { title, contract_number, start_date, end_date, value, status, document_id, description, responsible_id }) {
    try {
      const query = `
        UPDATE contracts
        SET title = ?, contract_number = ?, start_date = ?, end_date = ?, value = ?, 
            status = ?, document_id = ?, description = ?, responsible_id = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        title, contract_number, start_date, end_date, value, status, document_id, description, responsible_id, id
      ]);
      
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const query = `DELETE FROM contracts WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) as total FROM contracts WHERE 1=1`;
      const params = [];
      
      if (filters.client_id) {
        query += ` AND client_id = ?`;
        params.push(filters.client_id);
      }
      
      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
  
  static async getExpiringContracts(days = 30) {
    try {
      const query = `
        SELECT c.*, cl.name as client_name
        FROM contracts c
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE c.end_date IS NOT NULL
        AND c.end_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
        AND c.status = 'active'
        ORDER BY c.end_date ASC
      `;
      
      const [rows] = await pool.execute(query, [days]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contract;