/**
 * Middleware global de tratamento de erros
 */

// Handler para rotas não encontradas
function notFound(req, res, next) {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// Handler global de erros
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  console.error(`[ERROR] ${status} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
