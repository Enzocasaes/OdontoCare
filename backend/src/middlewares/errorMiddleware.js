export const notFound = (req, res) => {
  res.status(404).json({ message: `Rota n\u00e3o encontrada: ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Erro interno do servidor',
    details: err.details || null,
  });
};
