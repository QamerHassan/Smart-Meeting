const pool = require('../config/database');

class UserModel {
  static async create(email, hashedPassword, name) {
    const query = `
      INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `;
    const values = [email, hashedPassword, name];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = UserModel;