/**
 * Model Property - Gerenciamento de imóveis
 */
const { getDatabase } = require('../config/database');

class Property {
  /**
   * Buscar todos com filtros e paginação
   */
  static findAll({ page = 1, limit = 20, type, status, transaction_type, city, minPrice, maxPrice, bedrooms, search, agent_id, featured } = {}) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];

    if (type) { where += ' AND p.type = ?'; params.push(type); }
    if (status) { where += ' AND p.status = ?'; params.push(status); }
    if (transaction_type) { where += ' AND p.transaction_type = ?'; params.push(transaction_type); }
    if (city) { where += ' AND p.city LIKE ?'; params.push(`%${city}%`); }
    if (minPrice) { where += ' AND p.price >= ?'; params.push(minPrice); }
    if (maxPrice) { where += ' AND p.price <= ?'; params.push(maxPrice); }
    if (bedrooms) { where += ' AND p.bedrooms >= ?'; params.push(bedrooms); }
    if (agent_id) { where += ' AND p.agent_id = ?'; params.push(agent_id); }
    if (featured !== undefined) { where += ' AND p.featured = ?'; params.push(featured ? 1 : 0); }
    if (search) {
      where += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(`SELECT COUNT(*) as total FROM properties p ${where}`).get(...params).total;

    const stmt = db.prepare(
      `SELECT p.*, u.name as agent_name 
       FROM properties p 
       LEFT JOIN users u ON p.agent_id = u.id 
       ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    );
    const properties = stmt.all(...params, limit, offset).map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }));

    return { properties, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Buscar por ID
   */
  static findById(id) {
    const db = getDatabase();
    const property = db.prepare(
      `SELECT p.*, u.name as agent_name, u.email as agent_email, u.phone as agent_phone
       FROM properties p 
       LEFT JOIN users u ON p.agent_id = u.id 
       WHERE p.id = ?`
    ).get(id);

    if (property) {
      property.images = JSON.parse(property.images || '[]');
    }
    return property;
  }

  /**
   * Criar imóvel
   */
  static create(data) {
    const db = getDatabase();
    const stmt = db.prepare(
      `INSERT INTO properties (title, description, type, transaction_type, price, location, address, city, state, zip_code, bedrooms, bathrooms, parking_spots, area, status, images, featured, agent_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      data.title, data.description || null, data.type, data.transaction_type || 'venda',
      data.price, data.location, data.address || null, data.city || null,
      data.state || 'SP', data.zip_code || null, data.bedrooms || 0,
      data.bathrooms || 0, data.parking_spots || 0, data.area || null,
      data.status || 'disponivel', JSON.stringify(data.images || []),
      data.featured ? 1 : 0, data.agent_id || null
    );
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Atualizar imóvel
   */
  static update(id, data) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    const allowedFields = ['title', 'description', 'type', 'transaction_type', 'price', 'location', 'address', 'city', 'state', 'zip_code', 'bedrooms', 'bathrooms', 'parking_spots', 'area', 'status', 'featured', 'agent_id'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(field === 'featured' ? (data[field] ? 1 : 0) : data[field]);
      }
    }

    if (data.images !== undefined) {
      fields.push('images = ?');
      params.push(JSON.stringify(data.images));
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(id);
  }

  /**
   * Deletar imóvel
   */
  static delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM properties WHERE id = ?').run(id);
  }

  /**
   * Contar por status
   */
  static countByStatus() {
    const db = getDatabase();
    return db.prepare('SELECT status, COUNT(*) as count FROM properties GROUP BY status').all();
  }

  /**
   * Contar por tipo
   */
  static countByType() {
    const db = getDatabase();
    return db.prepare('SELECT type, COUNT(*) as count FROM properties GROUP BY type').all();
  }
}

module.exports = Property;
