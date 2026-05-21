/**
 * Middleware de autenticação e autorização
 * Verifica JWT tokens e controle de acesso baseado em roles
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { getDatabase } = require('../config/database');

/**
 * Verifica se o usuário está autenticado via JWT
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Verificar se o usuário ainda existe e está ativo
    const db = getDatabase();
    const user = db.prepare('SELECT id, name, email, role, active FROM users WHERE id = ?').get(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
}

/**
 * Middleware de autorização por role
 * @param  {...string} roles - Roles permitidos ('admin', 'agent', 'viewer')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.',
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
