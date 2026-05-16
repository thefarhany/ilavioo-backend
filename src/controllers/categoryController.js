const categoryService = require("../services/categoryService");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body.name);
  res
    .status(201)
    .json(successResponse(category, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories(
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(categories));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body.name);
  res.json(successResponse(category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json(successResponse({}, "Category deleted successfully"));
});

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };
