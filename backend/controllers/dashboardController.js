/**
 * Controller do Dashboard
 * Estatísticas e dados para gráficos
 */
const { getDatabase } = require('../config/database');

/**
 * GET /api/dashboard/stats - Estatísticas gerais
 */
async function getStats(req, res, next) {
  try {
    const db = getDatabase();

    // Totais gerais
    const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
    const availableProperties = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'disponivel'").get().count;
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
    const newLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'novo'").get().count;
    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    const pendingAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pendente'").get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE active = 1').get().count;
    const convertedLeads = db.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'convertido'").get().count;
    const totalConversations = db.prepare('SELECT COUNT(*) as count FROM chat_conversations').get().count;

    // Valor total dos imóveis disponíveis
    const totalValue = db.prepare("SELECT COALESCE(SUM(price), 0) as total FROM properties WHERE status = 'disponivel'").get().total;

    // Taxa de conversão
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Leads esta semana
    const leadsThisWeek = db.prepare(
      "SELECT COUNT(*) as count FROM leads WHERE created_at >= date('now', '-7 days')"
    ).get().count;

    // Agendamentos hoje
    const appointmentsToday = db.prepare(
      "SELECT COUNT(*) as count FROM appointments WHERE date = date('now')"
    ).get().count;

    res.json({
      success: true,
      data: {
        properties: { total: totalProperties, available: availableProperties, totalValue },
        leads: { total: totalLeads, new: newLeads, thisWeek: leadsThisWeek, conversionRate: parseFloat(conversionRate) },
        appointments: { total: totalAppointments, pending: pendingAppointments, today: appointmentsToday },
        users: { total: totalUsers },
        conversations: { total: totalConversations },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/charts - Dados para gráficos
 */
async function getCharts(req, res, next) {
  try {
    const db = getDatabase();

    // Leads por mês (6 meses)
    const leadsByMonth = db.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
       FROM leads WHERE created_at >= date('now', '-6 months')
       GROUP BY month ORDER BY month`
    ).all();

    // Imóveis por status
    const propertiesByStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM properties GROUP BY status'
    ).all();

    // Imóveis por tipo
    const propertiesByType = db.prepare(
      'SELECT type, COUNT(*) as count FROM properties GROUP BY type'
    ).all();

    // Leads por fonte
    const leadsBySource = db.prepare(
      'SELECT source, COUNT(*) as count FROM leads GROUP BY source'
    ).all();

    // Leads por status
    const leadsByStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
    ).all();

    // Agendamentos por status
    const appointmentsByStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    ).all();

    // Vendas/alugueis por mês
    const salesByMonth = db.prepare(
      `SELECT strftime('%Y-%m', updated_at) as month, status, COUNT(*) as count, SUM(price) as total_value
       FROM properties 
       WHERE status IN ('vendido', 'alugado') AND updated_at >= date('now', '-6 months')
       GROUP BY month, status ORDER BY month`
    ).all();

    // Top agentes (por leads convertidos)
    const topAgents = db.prepare(
      `SELECT u.name, u.id, COUNT(l.id) as leads_count,
              SUM(CASE WHEN l.status = 'convertido' THEN 1 ELSE 0 END) as conversions
       FROM users u
       LEFT JOIN leads l ON l.assigned_to = u.id
       WHERE u.role IN ('admin', 'agent') AND u.active = 1
       GROUP BY u.id ORDER BY conversions DESC LIMIT 5`
    ).all();

    res.json({
      success: true,
      data: {
        leadsByMonth,
        propertiesByStatus,
        propertiesByType,
        leadsBySource,
        leadsByStatus,
        appointmentsByStatus,
        salesByMonth,
        topAgents,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getCharts };
