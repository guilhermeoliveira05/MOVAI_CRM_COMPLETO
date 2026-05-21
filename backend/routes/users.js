/**
 * Rotas de Usuários (admin only)
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

// Todas as rotas requerem admin
router.use(authenticate, authorize('admin'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').isIn(['admin', 'agent', 'viewer']).withMessage('Role inválido'),
    handleValidation,
  ],
  userController.create
);

router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
