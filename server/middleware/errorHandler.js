const AppError = require('../utils/appError');

const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue || {})[0];
  const message = `${field} already exists. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req.method,
    path: req.path,
    body: req.body
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Copy error object to avoid mutation issues
  let error = { ...err };
  error.message = err.message;

  // Handle MongoDB Duplicate Key Error
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);

  // Handle Mongoose Validation Error
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
