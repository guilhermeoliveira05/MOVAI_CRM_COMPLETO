/**
 * Model Lead - Gerenciamento de leads/clientes
 */
const { getDatabase } = require('../config/database');

class Lead {
  static findAll({ page = 1, limit = 20, status, source, search, assigned_to, property_id } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND l.status = ?'; params.push(status); }
    if (source) { where += ' AND l.source = ?'; params.push(source); }
    if (assigned_to) { where += ' AND l.assigned_to = ?'; params.push(assigned_to); }
    if (property_id) { where += ' AND l.property_id = ?'; params.push(property_id); }
    if (search) {
      where += ' AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`SELECT COUNT(*) as total FROM leads l ${where}`).get(...params).total;

    const leads = db.prepare(
      `SELECT l.*, p.title as property_title, u.name as agent_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to = u.id
       ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id) {
    const db = getDatabase();
    return db.prepare(
      `SELECT l.*, p.title as property_title, u.name as agent_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = ?`
    ).get(id);
  }

  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare(
      `INSERT INTO leads (name, email, phone, message, property_id, status, source, assigned_to, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      data.name, data.email || null, data.phone || null, data.message || null,
      data.property_id || null, data.status || 'novo', data.source || 'site',
      data.assigned_to || null, data.notes || null
    );
    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'email', 'phone', 'message', 'property_id', 'status', 'source', 'assigned_to', 'notes'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  }

  static countByStatus() {
    const db = getDatabase();
    return db.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all();
  }

  static countBySource() {
    const db = getDatabase();
    return db.prepare('SELECT source, COUNT(*) as count FROM leads GROUP BY source').all();
  }

  /**
   * Leads por mês (para gráficos)
   */
  static countByMonth(months = 6) {
    const db = getDatabase();
    return db.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
       FROM leads 
       WHERE created_at >= date('now', '-${months} months')
       GROUP BY month ORDER BY month`
    ).all();
  }
}

module.exports = Lead;
