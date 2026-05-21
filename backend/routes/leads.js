/**
 * Rotas de Leads
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

// GET /api/leads
router.get('/', authenticate, leadController.getAll);

// GET /api/leads/:id
router.get('/:id', authenticate, leadController.getById);

// POST /api/leads - pode ser público (formulário do site) ou autenticado
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('phone').optional().trim(),
    handleValidation,
  ],
  leadController.create
);

// PUT /api/leads/:id
router.put('/:id', authenticate, authorize('admin', 'agent'), leadController.update);

// DELETE /api/leads/:id
router.delete('/:id', authenticate, authorize('admin'), leadController.remove);

// GET /api/leads/:id/interactions
router.get('/:id/interactions', authenticate, leadController.getInteractions);

// POST /api/leads/:id/interactions
router.post(
  '/:id/interactions',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('type').isIn(['ligacao', 'email', 'visita', 'mensagem', 'proposta', 'nota', 'chatbot']).withMessage('Tipo inválido'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
    handleValidation,
  ],
  leadController.addInteraction
);

module.exports = router;
