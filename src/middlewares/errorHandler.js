class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function notFound(req, res, next) {
  next(new ApiError(404, "Not Found"));
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response = { success: false, message };

  if (Array.isArray(err.errors) && err.errors.length) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

module.exports = { ApiError, notFound, errorHandler };
