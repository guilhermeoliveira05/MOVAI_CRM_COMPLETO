/**
 * Rotas do Dashboard
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/charts', dashboardController.getCharts);

module.exports = router;
