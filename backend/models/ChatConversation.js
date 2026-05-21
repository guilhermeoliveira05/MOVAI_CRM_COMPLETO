/**
 * Model ChatConversation - Histórico de conversas do chatbot
 */
const { getDatabase } = require('../config/database');

class ChatConversation {
  static findAll({ page = 1, limit = 20, status, lead_id, search } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND c.status = ?'; params.push(status); }
    if (lead_id) { where += ' AND c.lead_id = ?'; params.push(lead_id); }
    if (search) {
      where += ' AND (c.visitor_name LIKE ? OR c.visitor_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`SELECT COUNT(*) as total FROM chat_conversations c ${where}`).get(...params).total;

    const conversations = db.prepare(
      `SELECT c.*, l.name as lead_name
       FROM chat_conversations c
       LEFT JOIN leads l ON c.lead_id = l.id
       ${where} ORDER BY c.updated_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset).map(c => ({
      ...c,
      messages: JSON.parse(c.messages || '[]'),
      message_count: JSON.parse(c.messages || '[]').length,
    }));

    return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static findById(id) {
    const db = getDatabase();
    const conv = db.prepare(
      `SELECT c.*, l.name as lead_name
       FROM chat_conversations c
       LEFT JOIN leads l ON c.lead_id = l.id
       WHERE c.id = ?`
    ).get(id);

    if (conv) {
      conv.messages = JSON.parse(conv.messages || '[]');
    }
    return conv;
  }

  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare(
      `INSERT INTO chat_conversations (lead_id, visitor_name, visitor_email, messages, status)
       VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      data.lead_id || null, data.visitor_name || null,
      data.visitor_email || null, JSON.stringify(data.messages || []),
      data.status || 'ativa'
    );
    return this.findById(result.lastInsertRowid);
  }

  static addMessage(id, message) {
    const db = getDatabase();
    const conv = db.prepare('SELECT messages FROM chat_conversations WHERE id = ?').get(id);
    if (!conv) return null;

    const messages = JSON.parse(conv.messages || '[]');
    messages.push({ ...message, timestamp: new Date().toISOString() });

    db.prepare(
      'UPDATE chat_conversations SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(JSON.stringify(messages), id);

    return this.findById(id);
  }

  static updateStatus(id, status) {
    const db = getDatabase();
    db.prepare(
      'UPDATE chat_conversations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, id);
    return this.findById(id);
  }
}

module.exports = ChatConversation;
