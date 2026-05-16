const imageService = require("../services/imageService");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

const uploadImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const images = req.body.images;
  if (!images || !Array.isArray(images) || images.length === 0)
    return res.status(400).json(errorResponse("No images provided", {}, 400));
  const createdImages = await imageService.addProductImages(productId, images);
  res
    .status(201)
    .json(successResponse(createdImages, "Images uploaded successfully"));
});

const getProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const images = await imageService.getProductImages(productId);
  res.json(successResponse(images));
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const deleted = await imageService.deleteImage(imageId);
  if (!deleted) return res.status(404).json(errorResponse('Image not found', {}, 404));
  res.json(successResponse({}, 'Image deleted successfully'));
});

const setPrimaryImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const image = await imageService.setPrimaryImage(imageId);
  if (!image) return res.status(404).json(errorResponse('Image not found', {}, 404));
  res.json(successResponse(image, 'Primary image set successfully'));
});

module.exports = { uploadImages, getProductImages, deleteImage, setPrimaryImage };
