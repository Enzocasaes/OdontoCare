export const notFound = (req, res) => {
  res.status(404).json({ message: `Rota n\u00e3o encontrada: ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {  // Log do erro completo no console para debug
  console.error('❌ Error:', err);
    res.status(err.statusCode || 500).json({
    message: err.message || 'Erro interno do servidor',
    details: err.details || null,
  });
};
