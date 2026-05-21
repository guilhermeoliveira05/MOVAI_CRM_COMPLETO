/**
 * Rotas de Imóveis
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const upload = require('../middleware/upload');

// GET /api/properties - público
router.get('/', propertyController.getAll);

// GET /api/properties/:id - público
router.get('/:id', propertyController.getById);

// POST /api/properties - autenticado (admin/agent)
router.post(
  '/',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('title').trim().notEmpty().withMessage('Título é obrigatório'),
    body('type').isIn(['casa', 'apartamento', 'terreno', 'comercial', 'cobertura', 'studio']).withMessage('Tipo inválido'),
    body('price').isFloat({ min: 0 }).withMessage('Preço inválido'),
    body('location').trim().notEmpty().withMessage('Localização é obrigatória'),
    handleValidation,
  ],
  propertyController.create
);

// PUT /api/properties/:id - autenticado (admin/agent)
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'agent'),
  propertyController.update
);

// DELETE /api/properties/:id - autenticado (admin)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  propertyController.remove
);

// POST /api/properties/:id/upload-images
router.post(
  '/:id/upload-images',
  authenticate,
  authorize('admin', 'agent'),
  upload.array('images', 10),
  propertyController.uploadImages
);

module.exports = router;
