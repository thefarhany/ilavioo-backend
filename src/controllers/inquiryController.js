const inquiryService = require('../services/inquiryService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const asyncHandler = require('../middleware/asyncHandler');

const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.createInquiry(req.body);
  res
    .status(201)
    .json(successResponse(inquiry, 'Inquiry created successfully'));
});

const getPublicInquiries = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.getPublicInquiries(
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(inquiries));
});

const getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.getAllInquiries(
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(inquiries));
});

const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.updateInquiry(req.params.id, req.body);

  if (!inquiry) {
    return res.status(404).json(errorResponse('Inquiry not found'));
  }

  res.json(successResponse(inquiry, 'Inquiry updated successfully'));
});

module.exports = {
  createInquiry,
  getPublicInquiries,
  getAllInquiries,
  updateInquiry,
};
