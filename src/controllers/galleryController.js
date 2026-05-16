const galleryService = require("../services/galleryService");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const asyncHandler = require('../middleware/asyncHandler');

const createGallery = asyncHandler(async (req, res) => {
  const media = req.body.media;
  if (!media || !Array.isArray(media) || media.length === 0) {
    return res.status(400).json(errorResponse("No media provided", {}, 400));
  }
  const gallery = await galleryService.createGallery(req.body, media);
  res
    .status(201)
    .json(successResponse(gallery, "Gallery created successfully"));
});

const getAllGallery = asyncHandler(async (req, res) => {
  const gallery = await galleryService.getAllGallery(
    req.query.page,
    req.query.limit,
  );
  res.json(successResponse(gallery));
});

const deleteGallery = asyncHandler(async (req, res) => {
  const deleted = await galleryService.deleteGallery(req.params.id);
  if (!deleted)
    return res
      .status(404)
      .json(errorResponse("Gallery item not found", {}, 404));
  res.json(successResponse({}, "Gallery item deleted successfully"));
});

const updateGallery = asyncHandler(async (req, res) => {
  const gallery = await galleryService.updateGallery(req.params.id, req.body);
  if (!gallery)
    return res
      .status(404)
      .json(errorResponse('Gallery item not found', {}, 404));
  res.json(successResponse(gallery, 'Gallery item updated successfully'));
});

module.exports = { createGallery, getAllGallery, deleteGallery, updateGallery };
