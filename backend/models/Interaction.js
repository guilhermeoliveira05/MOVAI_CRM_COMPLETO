/**
 * Model Interaction - Histórico de interações com leads
 */
const { getDatabase } = require('../config/database');

class Interaction {
  static findByLeadId(leadId, { page = 1, limit = 50 } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) as total FROM interactions WHERE lead_id = ?').get(leadId).total;

    const interactions = db.prepare(
      `SELECT i.*, u.name as user_name
       FROM interactions i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.lead_id = ?
       ORDER BY i.created_at DESC LIMIT ? OFFSET ?`
    ).all(leadId, limit, offset);

    return { interactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare(
      'INSERT INTO interactions (lead_id, user_id, type, description) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(data.lead_id, data.user_id || null, data.type, data.description);
    return db.prepare(
      `SELECT i.*, u.name as user_name FROM interactions i LEFT JOIN users u ON i.user_id = u.id WHERE i.id = ?`
    ).get(result.lastInsertRowid);
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM interactions WHERE id = ?').run(id);
  }
}

module.exports = Interaction;
