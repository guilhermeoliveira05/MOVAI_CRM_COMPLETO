/**
 * Controller de Agendamentos
 */
const Appointment = require('../models/Appointment');

async function getAll(req, res, next) {
  try {
    const result = Appointment.findAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      date: req.query.date,
      lead_id: req.query.lead_id,
      property_id: req.query.property_id,
      agent_id: req.query.agent_id,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const appointment = Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const appointment = Appointment.create({
      ...req.body,
      agent_id: req.body.agent_id || req.user.id,
    });
    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }
    const appointment = Appointment.update(req.params.id, req.body);
    res.json({ success: true, message: 'Agendamento atualizado', data: appointment });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const existing = Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }

    // Auto-corrige referências órfãs para evitar erro de FK em bases antigas.
    Appointment.sanitizeMissingReferences(req.params.id);

    const appointment = Appointment.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, message: 'Status atualizado', data: appointment });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = Appointment.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }
    Appointment.delete(req.params.id);
    res.json({ success: true, message: 'Agendamento deletado' });
  } catch (err) {
    next(err);
  }
}

/**
 * Agendamento público (do site) - cria lead + agendamento
 */
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');

async function publicCreate(req, res, next) {
  try {
    const { name, email, phone, property_id, date, time, notes, message } = req.body;

    // Criar ou encontrar lead
    let lead;
    try {
      lead = Lead.create({
        name,
        email,
        phone,
        property_id: property_id || null,
        source: 'site',
        message: message || `Solicitação de visita para ${date} às ${time}`,
        status: 'novo',
      });
    } catch (err) {
      // Se lead já existe com mesmo email, tenta buscar
      lead = Lead.create({
        name,
        email: email || `${Date.now()}@temp.com`,
        phone,
        property_id: property_id || null,
        source: 'site',
        message: message || `Solicitação de visita para ${date} às ${time}`,
        status: 'novo',
      });
    }

    // Criar agendamento
    const appointment = Appointment.create({
      lead_id: lead.id,
      property_id: property_id || null,
      date,
      time,
      notes: notes || '',
      status: 'pendente',
    });

    // Log da interação
    try {
      Interaction.create({
        lead_id: lead.id,
        type: 'visita',
        description: `Visita agendada pelo site para ${date} às ${time}`,
      });
    } catch (e) { /* ignora erro de interação */ }

    res.status(201).json({
      success: true,
      message: 'Visita agendada com sucesso! Entraremos em contato para confirmar.',
      data: { lead, appointment },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, updateStatus, remove, publicCreate };
