/**
 * Controller de Relatórios
 * Gera dados para relatórios exportáveis
 */
const { getDatabase } = require('../config/database');

/**
 * GET /api/reports/properties - Relatório de imóveis
 */
async function propertiesReport(req, res, next) {
  try {
    const db = getDatabase();
    const { status, type, startDate, endDate } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND p.status = ?'; params.push(status); }
    if (type) { where += ' AND p.type = ?'; params.push(type); }
    if (startDate) { where += ' AND p.created_at >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND p.created_at <= ?'; params.push(endDate); }

    const properties = db.prepare(
      `SELECT p.id, p.title, p.type, p.transaction_type, p.price, p.location, p.city,
              p.bedrooms, p.bathrooms, p.area, p.status, p.created_at, u.name as agent_name
       FROM properties p
       LEFT JOIN users u ON p.agent_id = u.id
       ${where} ORDER BY p.created_at DESC`
    ).all(...params);

    const summary = {
      total: properties.length,
      totalValue: properties.reduce((sum, p) => sum + p.price, 0),
      byStatus: {},
      byType: {},
    };

    properties.forEach((p) => {
      summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
      summary.byType[p.type] = (summary.byType[p.type] || 0) + 1;
    });

    res.json({ success: true, data: { summary, properties } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/leads - Relatório de leads
 */
async function leadsReport(req, res, next) {
  try {
    const db = getDatabase();
    const { status, source, startDate, endDate } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND l.status = ?'; params.push(status); }
    if (source) { where += ' AND l.source = ?'; params.push(source); }
    if (startDate) { where += ' AND l.created_at >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND l.created_at <= ?'; params.push(endDate); }

    const leads = db.prepare(
      `SELECT l.id, l.name, l.email, l.phone, l.status, l.source, l.created_at,
              p.title as property_title, u.name as agent_name
       FROM leads l
       LEFT JOIN properties p ON l.property_id = p.id
       LEFT JOIN users u ON l.assigned_to = u.id
       ${where} ORDER BY l.created_at DESC`
    ).all(...params);

    const summary = {
      total: leads.length,
      byStatus: {},
      bySource: {},
    };

    leads.forEach((l) => {
      summary.byStatus[l.status] = (summary.byStatus[l.status] || 0) + 1;
      summary.bySource[l.source] = (summary.bySource[l.source] || 0) + 1;
    });

    res.json({ success: true, data: { summary, leads } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reports/sales - Relatório de vendas/alugueis
 */
async function salesReport(req, res, next) {
  try {
    const db = getDatabase();
    const { startDate, endDate } = req.query;

    let where = "WHERE p.status IN ('vendido', 'alugado')";
    const params = [];

    if (startDate) { where += ' AND p.updated_at >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND p.updated_at <= ?'; params.push(endDate); }

    const sales = db.prepare(
      `SELECT p.id, p.title, p.type, p.transaction_type, p.price, p.location, p.city,
              p.status, p.updated_at as sale_date, u.name as agent_name
       FROM properties p
       LEFT JOIN users u ON p.agent_id = u.id
       ${where} ORDER BY p.updated_at DESC`
    ).all(...params);

    const summary = {
      totalSales: sales.filter((s) => s.status === 'vendido').length,
      totalRentals: sales.filter((s) => s.status === 'alugado').length,
      totalSalesValue: sales.filter((s) => s.status === 'vendido').reduce((sum, s) => sum + s.price, 0),
      totalRentalsValue: sales.filter((s) => s.status === 'alugado').reduce((sum, s) => sum + s.price, 0),
    };

    res.json({ success: true, data: { summary, sales } });
  } catch (err) {
    next(err);
  }
}

module.exports = { propertiesReport, leadsReport, salesReport };
