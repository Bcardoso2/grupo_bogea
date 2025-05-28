 
// server/src/models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create({ name, email, password, role = 'user' }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const query = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [name, email, hashedPassword, role]);
      
      return {
        id: result.insertId,
        name,
        email,
        role
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async findById(id) {
    try {
      const query = `
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  static async findByEmail(email) {
    try {
      const query = `SELECT * FROM users WHERE email = ?`;
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.role) {
        query += ` AND role = ?`;
        params.push(filters.role);
      }
      
      if (filters.search) {
        query += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ` ORDER BY name`;
      
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
  
  static async update(id, { name, email, role }) {
    try {
      const query = `
        UPDATE users
        SET name = ?, email = ?, role = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [name, email, role, id]);
      return this.findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  static async changePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = `UPDATE users SET password = ? WHERE id = ?`;
      await pool.execute(query, [hashedPassword, id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  static async delete(id) {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  static async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
      const params = [];
      
      if (filters.role) {
        query += ` AND role = ?`;
        params.push(filters.role);
      }
      
      if (filters.search) {
        query += ` AND (name LIKE ? OR email LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
