/**
 * Rotas de Relatórios
 */
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'agent'));

router.get('/properties', reportController.propertiesReport);
router.get('/leads', reportController.leadsReport);
router.get('/sales', reportController.salesReport);

module.exports = router;
