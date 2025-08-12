function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate Key Error',
      details: 'This email is already registered'
    });
  }

  res.status(500).json({
    error: 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
}

module.exports = errorHandler;
