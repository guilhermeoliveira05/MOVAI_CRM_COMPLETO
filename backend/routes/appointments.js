/**
 * Rotas de Agendamentos
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

// POST /api/appointments/public - público (formulário do site)
router.post(
  '/public',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('phone').optional().trim(),
    body('date').isDate().withMessage('Data inválida (YYYY-MM-DD)'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida (HH:MM)'),
    handleValidation,
  ],
  appointmentController.publicCreate
);

router.get('/', authenticate, appointmentController.getAll);
router.get('/:id', authenticate, appointmentController.getById);

router.post(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('lead_id').isInt().withMessage('Lead ID é obrigatório'),
    body('property_id').isInt().withMessage('Property ID é obrigatório'),
    body('date').isDate().withMessage('Data inválida (YYYY-MM-DD)'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida (HH:MM)'),
    handleValidation,
  ],
  appointmentController.create
);

router.put('/:id', authenticate, authorize('admin', 'agent'), appointmentController.update);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('status').isIn(['pendente', 'confirmado', 'cancelado', 'realizado']).withMessage('Status inválido'),
    handleValidation,
  ],
  appointmentController.updateStatus
);

router.delete('/:id', authenticate, authorize('admin'), appointmentController.remove);

module.exports = router;
