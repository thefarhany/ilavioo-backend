const productService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const asyncHandler = require('../middleware/asyncHandler');

const createProduct = asyncHandler(async (req, res) => {
  const images = req.body.images || [];
  const product = await productService.createProduct(req.body, images);
  res.status(201).json(successResponse(product, 'Product created successfully'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const images = req.body.images || [];
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    images
  );

  if (!product) {
    return res.status(404).json(errorResponse('Product not found', {}, 404));
  }

  res.json(successResponse(product, 'Product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.softDeleteProduct(req.params.id);

  if (!product) {
    return res.status(404).json(errorResponse('Product not found', {}, 404));
  }

  res.json(successResponse({}, 'Product deleted successfully'));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(products));
});

const getPublicProducts = asyncHandler(async (req, res) => {
  const products = await productService.getPublicProducts(
    req.query,
    req.query.page,
    req.query.limit
  );
  res.json(successResponse(products));
});

const getPublicProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProductBySlug(req.params.slug);

  if (!product) {
    return res.status(404).json(errorResponse('Product not found', {}, 404));
  }

  res.json(successResponse(product));
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getPublicProducts,
  getPublicProductBySlug
};
