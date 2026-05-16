const statsService = require('../services/statsService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const asyncHandler = require('../middleware/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getDashboardStats();
  res.json(successResponse(stats));
});

module.exports = { getDashboardStats };
