// Switched from Joi to Zod – Zod is lightweight and works sync.
const { ZodError } = require('zod');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Returns an Express middleware that validates `req.body` against a Zod schema.
 * On validation failure it sends a 400 response using the unified error format.
 */
function validateBody(schema) {
  return function (req, res, next) {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // sanitized value
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const messages = e.errors.map(err => err.message);
        console.error(`[ZOD VALIDATION ERROR]`, e.errors);
        return res.status(400).json(errorResponse('Validation Error', messages, 400));
      }
      next(e);
    }
  };
}

module.exports = { validateBody };
