// server/src/models/Document.js - VERSÃO CORRIGIDA
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

class Document {
  static async create({ title, description, file_path, file_type, file_size, category, client_id, status, uploaded_by }) {
    try {
      const query = `
        INSERT INTO documents 
        (title, description, file_path, file_type, file_size, category, client_id, status, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        title, description, file_path, file_type, file_size, category, client_id, status, uploaded_by
      ]);
      
      return {
        id: result.insertId,
        title,
        description,
        file_path,
        file_type,
        file_size,
        category,
        client_id,
        status,
        uploaded_by
      };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT d.*, c.name as client_name, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.id = ?
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
        SELECT d.*, c.name as client_name, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN clients c ON d.client_id = c.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.search) {
        query += ` AND (d.title LIKE ? OR d.description LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.title) {
        query += ` AND d.title LIKE ?`;
        params.push(`%${filters.title}%`);
      }

      if (filters.category) {
        query += ` AND d.category = ?`;
        params.push(filters.category);
      }

      if (filters.client_id) {
        query += ` AND d.client_id = ?`;
        params.push(filters.client_id);
      }

      if (filters.status) {
        query += ` AND d.status = ?`;
        params.push(filters.status);
      }

      query += ` ORDER BY d.created_at DESC`;

      let results;
      if (filters.page && filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = (parseInt(filters.page) - 1) * limit;
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        console.log('📋 Query findAll (com paginação):', query);
        console.log('📋 Params findAll:', params);

        results = await pool.query(query, params);
      } else {
        console.log('📋 Query findAll (sem paginação):', query);
        console.log('📋 Params findAll:', params);

        results = await pool.execute(query, params);
      }

      const [rows] = results;
      return rows;
    } catch (error) {
      console.error('❌ Erro em findAll:', error);
      throw error;
    }
  }

  static async update(id, { title, description, category, client_id, status }) {
    try {
      const query = `
        UPDATE documents
        SET title = ?, description = ?, category = ?, client_id = ?, status = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [title, description, category, client_id, status, id]);
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const document = await this.findById(id);
      if (!document) {
        throw new Error('Documento não encontrado');
      }

      const filePath = path.join(__dirname, '../..', document.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const query = `DELETE FROM documents WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) as total FROM documents WHERE 1=1`;
      const params = [];

      if (filters.search) {
        query += ` AND (title LIKE ? OR description LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.title) {
        query += ` AND title LIKE ?`;
        params.push(`%${filters.title}%`);
      }

      if (filters.category) {
        query += ` AND category = ?`;
        params.push(filters.category);
      }

      if (filters.client_id) {
        query += ` AND client_id = ?`;
        params.push(filters.client_id);
      }

      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }

      console.log('🔢 Query count:', query);
      console.log('🔢 Params count:', params);

      const [rows] = await pool.execute(query, params);
      return rows[0].total;
    } catch (error) {
      console.error('❌ Erro em count:', error);
      throw error;
    }
  }
}

module.exports = Document;
