 
// server/src/models/Tag.js
const { pool } = require('../config/database');

class Tag {
  static async create({ name, color = '#cccccc' }) {
    try {
      const query = `INSERT INTO tags (name, color) VALUES (?, ?)`;
      const [result] = await pool.execute(query, [name, color]);
      
      return {
        id: result.insertId,
        name,
        color
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const query = `SELECT * FROM tags WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll() {
    try {
      const query = `SELECT * FROM tags ORDER BY name`;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, { name, color }) {
    try {
      const query = `UPDATE tags SET name = ?, color = ? WHERE id = ?`;
      await pool.execute(query, [name, color, id]);
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const query = `DELETE FROM tags WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async addToDocument(documentId, tagId) {
    try {
      const query = `INSERT IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)`;
      await pool.execute(query, [documentId, tagId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async removeFromDocument(documentId, tagId) {
    try {
      const query = `DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?`;
      await pool.execute(query, [documentId, tagId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async getDocumentTags(documentId) {
    try {
      const query = `
        SELECT t.* FROM tags t
        JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = ?
        ORDER BY t.name
      `;
      const [rows] = await pool.execute(query, [documentId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Tag;