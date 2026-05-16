const contactService = require("../services/contactService");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require("../middleware/asyncHandler");

const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.body);
  res.status(201).json(successResponse(contact, "Message sent successfully"));
});

module.exports = { createContact };
