const testimonialService = require("../services/testimonialService");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.createTestimonial(req.body);
  res.status(201).json(successResponse(testimonial, "Testimonial created successfully"));
});

const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAllTestimonials(
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(testimonials));
});

const getActiveTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getActiveTestimonials(req.query.limit);
  res.json(successResponse(testimonials));
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body);
  if (!testimonial) {
    return res.status(404).json(errorResponse("Testimonial not found", {}, 404));
  }
  res.json(successResponse(testimonial, "Testimonial updated successfully"));
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  await testimonialService.deleteTestimonial(req.params.id);
  res.json(successResponse({}, "Testimonial deleted successfully"));
});

module.exports = {
  createTestimonial,
  getAllTestimonials,
  getActiveTestimonials,
  updateTestimonial,
  deleteTestimonial,
};
