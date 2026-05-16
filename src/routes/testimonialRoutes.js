const express = require("express");
const router = express.Router();
const {
  createTestimonial,
  getAllTestimonials,
  getActiveTestimonials,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { authenticate } = require("../middleware/authMiddleware");
const csrfProtection = require("../middleware/csrfProtection");

// Public routes
router.get("/active", getActiveTestimonials);

// Admin routes
router.use(csrfProtection);
router.use(authenticate);
router.post("/", createTestimonial);
router.get("/", getAllTestimonials);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

module.exports = router;
