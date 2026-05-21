/**
 * Rotas de Autenticação
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'agent', 'viewer']).withMessage('Role inválido'),
    handleValidation,
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
    handleValidation,
  ],
  authController.login
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;
