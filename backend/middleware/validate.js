/**
 * Middleware de validação usando express-validator
 */
const { validationResult } = require('express-validator');

/**
 * Processa os resultados da validação e retorna erros se houver
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { handleValidation };
