/**
 * Model User - Gerenciamento de usuários do sistema
 */
const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Buscar todos os usuários (sem senha)
   */
  static findAll({ page = 1, limit = 20, role, search } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (role) {
      where += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM users ${where}`);
    const total = countStmt.get(...params).total;

    const stmt = db.prepare(
      `SELECT id, name, email, role, phone, avatar, active, created_at, updated_at 
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    );
    const users = stmt.all(...params, limit, offset);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Buscar por ID (sem senha)
   */
  static findById(id) {
    const db = getDatabase();
    return db.prepare(
      'SELECT id, name, email, role, phone, avatar, active, created_at, updated_at FROM users WHERE id = ?'
    ).get(id);
  }

  /**
   * Buscar por email (com senha, para login)
   */
  static findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Criar usuário
   */
  static create({ name, email, password, role = 'agent', phone, avatar }) {
    const db = getDatabase();
    const password_hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password_hash, role, phone, avatar) 
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(name, email, password_hash, role, phone || null, avatar || null);
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Atualizar usuário
   */
  static update(id, { name, email, role, phone, avatar, active }) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (role !== undefined) { fields.push('role = ?'); params.push(role); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (avatar !== undefined) { fields.push('avatar = ?'); params.push(avatar); }
    if (active !== undefined) { fields.push('active = ?'); params.push(active); }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  /**
   * Atualizar senha
   */
  static updatePassword(id, newPassword) {
    const db = getDatabase();
    const password_hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(password_hash, id);
  }

  /**
   * Deletar usuário (soft delete)
   */
  static delete(id) {
    const db = getDatabase();
    db.prepare('UPDATE users SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }

  /**
   * Verificar senha
   */
  static verifyPassword(plainPassword, hash) {
    return bcrypt.compareSync(plainPassword, hash);
  }
}

module.exports = User;
