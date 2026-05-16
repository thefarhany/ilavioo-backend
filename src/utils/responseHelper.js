const successResponse = (data = {}, message = "Success", meta = {}) => ({
  success: true,
  message,
  data,
  meta,
});
const ERROR_CODES = {
  OK: { code: "00", statusCode: 200 },
  AUTH_ERROR: { code: "01", statusCode: 401, message: "Unauthorized" },
  INVALID_EMAIL: {
    code: "02",
    statusCode: 400,
    message: "Invalid email format",
  },
  MISSING_FIELD: {
    code: "03",
    statusCode: 400,
    message: "Required field missing",
  },
  NOT_FOUND: { code: "04", statusCode: 404, message: "Resource not found" },
  INVALID_STATUS: { code: "05", statusCode: 400, message: "Invalid status" },
  VALIDATION_ERROR: {
    code: "06",
    statusCode: 400,
    message: "Validation failed",
  },
  SERVER_ERROR: {
    code: "99",
    statusCode: 500,
    message: "Internal server error",
  },
};
const getErrorCode = (message) => {
  if (!message) return ERROR_CODES.SERVER_ERROR;
  const msg = message.toLowerCase();
  if (msg.includes("invalid email") || msg.includes("email"))
    return ERROR_CODES.INVALID_EMAIL;
  if (msg.includes("required") || msg.includes("missing"))
    return ERROR_CODES.MISSING_FIELD;
  if (msg.includes("not found") || msg.includes("404"))
    return ERROR_CODES.NOT_FOUND;
  if (msg.includes("invalid status") || msg.includes("status"))
    return ERROR_CODES.INVALID_STATUS;
  if (msg.includes("validation") || msg.includes("format"))
    return ERROR_CODES.VALIDATION_ERROR;
  if (msg.includes("unauthorized") || msg.includes("auth"))
    return ERROR_CODES.AUTH_ERROR;
  if (msg.includes("success") || msg.includes("ok")) return ERROR_CODES.OK;
  return ERROR_CODES.SERVER_ERROR;
};
const isProduction = process.env.NODE_ENV === 'production';
const errorResponse = (
  message = "Internal Server Error",
  errors = {},
  customStatusCode = null,
) => {
  const errorInfo = getErrorCode(message);
  const statusCode = customStatusCode || errorInfo.statusCode;
  const safeMessage = isProduction && statusCode >= 500
    ? errorInfo.message
    : message || errorInfo.message;
  return {
    success: false,
    message: safeMessage,
    errors,
    statusCode,
    errorCode: errorInfo.code,
  };
};
module.exports = { successResponse, errorResponse, ERROR_CODES };
