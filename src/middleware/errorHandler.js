const { errorResponse } = require("../utils/responseHelper");
const logger = require("../utils/logger");

const isProduction = process.env.NODE_ENV === "production";

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', err, {
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json(errorResponse("Validation Error", err.errors, 400));
  }
  
  if (err.name === "NotFoundError") {
    return res
      .status(404)
      .json(errorResponse("Resource Not Found", err.message, 404));
  }
  
  if (err.name === "ZodError") {
    const messages = err.errors.map(e => e.message);
    return res
      .status(400)
      .json(errorResponse("Validation Error", messages, 400));
  }

  if (err.code === 'P2002') {
    return res
      .status(409)
      .json(errorResponse("A record with this value already exists", {}, 409));
  }

  if (err.code === 'P2025') {
    return res
      .status(404)
      .json(errorResponse("Record not found", {}, 404));
  }
  
  const message = isProduction ? "Internal Server Error" : err.message;
  res
    .status(500)
    .json(errorResponse(message, isProduction ? {} : { stack: err.stack }, 500));
};

const notFoundHandler = (req, res, next) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  return res
    .status(404)
    .json(
      errorResponse(
        "Route Not Found",
        "The requested route does not exist",
        404,
      ),
    );
};

module.exports = { errorHandler, notFoundHandler };
