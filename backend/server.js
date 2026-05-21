/**
 * MOVAI CRM - Servidor Principal
 * API RESTful para gerenciamento de imóveis, leads e agendamentos
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Inicializar banco de dados
const { initializeDatabase } = require('./database/init');
const { closeDatabase } = require('./config/database');

// Middleware de erros
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Rotas
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const leadRoutes = require('./routes/leads');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const chatbotRoutes = require('./routes/chatbot');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { success: false, message: 'Muitas requisições, tente novamente mais tarde.' },
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROTAS ====================

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', reportRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MOVAI CRM API está rodando',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== INICIALIZAÇÃO ====================
try {
  initializeDatabase();
  console.log('\n💾 Banco de dados pronto');
} catch (err) {
  console.error('❌ Erro ao inicializar banco de dados:', err.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`\n🚀 MOVAI CRM API rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

module.exports = app;
