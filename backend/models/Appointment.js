/**
 * Model Appointment - Gerenciamento de agendamentos de visitas
 */
const { getDatabase } = require('../config/database');

class Appointment {
  static findAll({ page = 1, limit = 20, status, date, lead_id, property_id, agent_id, startDate, endDate } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND a.status = ?'; params.push(status); }
    if (date) { where += ' AND a.date = ?'; params.push(date); }
    if (lead_id) { where += ' AND a.lead_id = ?'; params.push(lead_id); }
    if (property_id) { where += ' AND a.property_id = ?'; params.push(property_id); }
    if (agent_id) { where += ' AND a.agent_id = ?'; params.push(agent_id); }
    if (startDate) { where += ' AND a.date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND a.date <= ?'; params.push(endDate); }

    const total = db.prepare(`SELECT COUNT(*) as total FROM appointments a ${where}`).get(...params).total;

    const appointments = db.prepare(
      `SELECT a.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email,
              p.title as property_title, p.location as property_location,
              u.name as agent_name
       FROM appointments a
       LEFT JOIN leads l ON a.lead_id = l.id
       LEFT JOIN properties p ON a.property_id = p.id
       LEFT JOIN users u ON a.agent_id = u.id
       ${where} ORDER BY a.date ASC, a.time ASC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    return { appointments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id) {
    const db = getDatabase();
    return db.prepare(
      `SELECT a.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email,
              p.title as property_title, p.location as property_location,
              u.name as agent_name
       FROM appointments a
       LEFT JOIN leads l ON a.lead_id = l.id
       LEFT JOIN properties p ON a.property_id = p.id
       LEFT JOIN users u ON a.agent_id = u.id
       WHERE a.id = ?`
    ).get(id);
  }

  static assertForeignKeyExists(db, table, id, label) {
    if (id === undefined || id === null) return;

    const exists = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
    if (!exists) {
      const err = new Error(`${label} inválido: ${id}`);
      err.status = 400;
      throw err;
    }
  }

  static sanitizeMissingReferences(id) {
    const db = getDatabase();
    const appointment = db.prepare('SELECT id, lead_id, property_id FROM appointments WHERE id = ?').get(id);
    if (!appointment) return null;

    const patch = {};

    if (appointment.lead_id !== null) {
      const leadExists = db.prepare('SELECT id FROM leads WHERE id = ?').get(appointment.lead_id);
      if (!leadExists) patch.lead_id = null;
    }

    if (appointment.property_id !== null) {
      const propertyExists = db.prepare('SELECT id FROM properties WHERE id = ?').get(appointment.property_id);
      if (!propertyExists) patch.property_id = null;
    }

    if (Object.keys(patch).length > 0) {
      this.update(id, patch);
    }

    return this.findById(id);
  }

  static create(data) {
    const db = getDatabase();
    this.assertForeignKeyExists(db, 'leads', data.lead_id, 'Lead ID');
    this.assertForeignKeyExists(db, 'properties', data.property_id, 'Property ID');

    const stmt = db.prepare(
      `INSERT INTO appointments (lead_id, property_id, agent_id, date, time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      data.lead_id ?? null, data.property_id ?? null, data.agent_id || null,
      data.date, data.time, data.status || 'pendente', data.notes || null
    );
    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(data, 'lead_id')) {
      this.assertForeignKeyExists(db, 'leads', data.lead_id, 'Lead ID');
    }
    if (Object.prototype.hasOwnProperty.call(data, 'property_id')) {
      this.assertForeignKeyExists(db, 'properties', data.property_id, 'Property ID');
    }

    const allowedFields = ['lead_id', 'property_id', 'agent_id', 'date', 'time', 'status', 'notes'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  static updateStatus(id, status) {
    return this.update(id, { status });
  }

  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  }

  static countByStatus() {
    const db = getDatabase();
    return db.prepare('SELECT status, COUNT(*) as count FROM appointments GROUP BY status').all();
  }

  /**
   * Próximos agendamentos
   */
  static getUpcoming(limit = 5) {
    const db = getDatabase();
    return db.prepare(
      `SELECT a.*, l.name as lead_name, p.title as property_title, u.name as agent_name
       FROM appointments a
       LEFT JOIN leads l ON a.lead_id = l.id
       LEFT JOIN properties p ON a.property_id = p.id
       LEFT JOIN users u ON a.agent_id = u.id
       WHERE a.date >= date('now') AND a.status IN ('pendente', 'confirmado')
       ORDER BY a.date ASC, a.time ASC LIMIT ?`
    ).all(limit);
  }
}

module.exports = Appointment;
