/**
 * Controller do Chatbot
 * Gerenciamento de conversas
 */
const ChatConversation = require('../models/ChatConversation');

async function getAll(req, res, next) {
  try {
    const result = ChatConversation.findAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      lead_id: req.query.lead_id,
      search: req.query.search,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const conversation = ChatConversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

/**
 * Criar nova conversa (público - do site)
 */
async function create(req, res, next) {
  try {
    const { lead_id, messages, status } = req.body;
    const conversation = ChatConversation.create({
      lead_id: lead_id || null,
      messages: messages || [],
      status: status || 'ativa',
    });
    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

/**
 * Adicionar mensagem a conversa existente (público)
 */
async function addMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !message.role || !message.content) {
      return res.status(400).json({ success: false, message: 'Mensagem inválida (role e content obrigatórios)' });
    }
    const conversation = ChatConversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversa não encontrada' });
    }
    const updated = ChatConversation.addMessage(req.params.id, message);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, addMessage };
