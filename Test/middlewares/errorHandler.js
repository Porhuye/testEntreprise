// /middlewares/errorHandler.js
const isApi = (req) =>
  req.originalUrl.startsWith('/api') ||
  req.headers.accept?.includes('application/json');

module.exports = (err, req, res, _next) => {
  const status = err.status || 500;

  // Log côté serveur (sans secrets)
  console.error('[ERROR]', {
    url: req.originalUrl,
    method: req.method,
    status,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  if (isApi(req)) {
    return res.status(status).json({
      error: err.code || 'server_error',
      message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message,
    });
  }

  // Page HTML (fallback simple)
  res.status(status).render('error', {
    title: 'Erreur',
    message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message,
  });
};
