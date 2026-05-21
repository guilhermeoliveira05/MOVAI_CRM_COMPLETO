/**
 * Rotas do Chatbot
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

// POST /api/chatbot/conversations - público (do site)
router.post(
  '/conversations',
  [
    body('messages').optional().isArray().withMessage('Messages deve ser um array'),
    handleValidation,
  ],
  chatbotController.create
);

// POST /api/chatbot/conversations/:id/messages - público (do site)
router.post(
  '/conversations/:id/messages',
  [
    body('message').isObject().withMessage('Message é obrigatório'),
    body('message.role').notEmpty().withMessage('Role é obrigatório'),
    body('message.content').notEmpty().withMessage('Content é obrigatório'),
    handleValidation,
  ],
  chatbotController.addMessage
);

// Rotas autenticadas (CRM admin)
router.get('/conversations', authenticate, chatbotController.getAll);
router.get('/conversations/:id', authenticate, chatbotController.getById);

module.exports = router;
