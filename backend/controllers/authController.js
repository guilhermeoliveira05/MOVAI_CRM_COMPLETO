/**
 * Controller de Autenticação
 * Gerencia login, registro e perfil do usuário
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

/**
 * POST /api/auth/register - Registrar novo usuário
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;

    // Verificar se email já existe
    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    const user = User.create({ name, email, password, role, phone });

    // Gerar token
    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login - Login de usuário
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Buscar usuário com senha
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Contate o administrador.',
      });
    }

    // Verificar senha
    const isValid = User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Gerar token
    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Remover senha da resposta
    const { password_hash, ...userData } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: { user: userData, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me - Obter perfil do usuário autenticado
 */
async function getMe(req, res, next) {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
