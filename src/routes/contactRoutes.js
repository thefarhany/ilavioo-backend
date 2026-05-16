const express = require("express");
const router = express.Router();
const { createContact } = require("../controllers/contactController");
const { inquiryLimiter } = require("../middleware/rateLimiter");
const { validateBody } = require("../middleware/validationMiddleware");
const { contactCreateSchema } = require("../validation/schemas");

// Public route - contact form has stricter rate limiting
router.post("/", inquiryLimiter, validateBody(contactCreateSchema), createContact);

module.exports = router;
