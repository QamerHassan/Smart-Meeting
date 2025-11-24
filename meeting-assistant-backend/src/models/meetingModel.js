const pool = require('../config/database');

class MeetingModel {
  static async create(meetingData) {
    const { title, description, start_time, end_time, location, meeting_link, created_by } = meetingData;
    const query = `
      INSERT INTO meetings (title, description, start_time, end_time, location, meeting_link, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [title, description, start_time, end_time, location, meeting_link, created_by];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT m.*, u.name as creator_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      ORDER BY m.start_time DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT m.*, u.name as creator_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByUser(userId) {
    const query = `
      SELECT DISTINCT m.*, u.name as creator_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      WHERE m.created_by = $1 OR mp.user_id = $1
      ORDER BY m.start_time DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async update(id, meetingData) {
    const { title, description, start_time, end_time, location, meeting_link, status } = meetingData;
    const query = `
      UPDATE meetings
      SET title = $1, description = $2, start_time = $3, end_time = $4,
          location = $5, meeting_link = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const values = [title, description, start_time, end_time, location, meeting_link, status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM meetings WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async addParticipant(meetingId, userId) {
    const query = `
      INSERT INTO meeting_participants (meeting_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (meeting_id, user_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [meetingId, userId]);
    return result.rows[0];
  }

  static async getParticipants(meetingId) {
    const query = `
      SELECT u.id, u.name, u.email, mp.status
      FROM meeting_participants mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.meeting_id = $1
    `;
    const result = await pool.query(query, [meetingId]);
    return result.rows;
  }
}

module.exports = MeetingModel;