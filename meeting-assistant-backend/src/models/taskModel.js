const pool = require('../config/database');

class TaskModel {
  static async create(taskData) {
    const { title, description, assigned_to, meeting_id, priority, due_date, created_by } = taskData;
    const query = `
      INSERT INTO tasks (title, description, assigned_to, meeting_id, priority, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [title, description, assigned_to, meeting_id, priority, due_date, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT t.*, u.name as assignee_name, m.title as meeting_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN meetings m ON t.meeting_id = m.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT t.*, u.name as assignee_name, m.title as meeting_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN meetings m ON t.meeting_id = m.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByUser(userId) {
    const query = `
      SELECT t.*, u.name as assignee_name, m.title as meeting_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN meetings m ON t.meeting_id = m.id
      WHERE t.assigned_to = $1
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getByMeeting(meetingId) {
    const query = `
      SELECT t.*, u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.meeting_id = $1
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [meetingId]);
    return result.rows;
  }

  static async update(id, taskData) {
    const { title, description, assigned_to, status, priority, due_date } = taskData;
    const query = `
      UPDATE tasks
      SET title = $1, description = $2, assigned_to = $3, status = $4,
          priority = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [title, description, assigned_to, status, priority, due_date, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE tasks
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
}

module.exports = TaskModel;