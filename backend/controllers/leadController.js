/**
 * Controller de Leads
 * CRUD + interações
 */
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');

async function getAll(req, res, next) {
  try {
    const result = Lead.findAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      source: req.query.source,
      search: req.query.search,
      assigned_to: req.query.assigned_to,
      property_id: req.query.property_id,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead não encontrado' });
    }
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const lead = Lead.create(req.body);

    // Criar interação automática de registro
    Interaction.create({
      lead_id: lead.id,
      user_id: req.user ? req.user.id : null,
      type: 'nota',
      description: `Lead criado via ${req.body.source || 'site'}`,
    });

    res.status(201).json({
      success: true,
      message: 'Lead criado com sucesso',
      data: lead,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead não encontrado' });
    }

    // Se status mudou, registrar interação
    if (req.body.status && req.body.status !== existing.status) {
      Interaction.create({
        lead_id: existing.id,
        user_id: req.user.id,
        type: 'nota',
        description: `Status alterado de "${existing.status}" para "${req.body.status}"`,
      });
    }

    const lead = Lead.update(req.params.id, req.body);
    res.json({ success: true, message: 'Lead atualizado com sucesso', data: lead });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const existing = Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Lead não encontrado' });
    }
    Lead.delete(req.params.id);
    res.json({ success: true, message: 'Lead deletado com sucesso' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/leads/:id/interactions - Histórico de interações do lead
 */
async function getInteractions(req, res, next) {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead não encontrado' });
    }

    const result = Interaction.findByLeadId(req.params.id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/leads/:id/interactions - Adicionar interação
 */
async function addInteraction(req, res, next) {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead não encontrado' });
    }

    const interaction = Interaction.create({
      lead_id: parseInt(req.params.id),
      user_id: req.user.id,
      type: req.body.type,
      description: req.body.description,
    });

    res.status(201).json({
      success: true,
      message: 'Interação registrada com sucesso',
      data: interaction,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove, getInteractions, addInteraction };
