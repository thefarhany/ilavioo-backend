const express = require('express');
const router = express.Router();
const { uploadImages, getProductImages, deleteImage, setPrimaryImage } = require('../controllers/imageController');
const { authenticate } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfProtection');

// Routes are mounted under /api/images
// POST /api/images/products/:productId/upload - Upload images to a specific product (protected)
// Body: { images: [{ url, publicId }] }
router.post('/products/:productId/upload', csrfProtection, authenticate, uploadImages);

// GET /api/images/products/:productId - Get all images for a specific product (protected)
router.get('/products/:productId', authenticate, getProductImages);

// DELETE /api/images/products/:imageId - Delete a product image (protected)
router.delete('/products/:imageId', csrfProtection, authenticate, deleteImage);

// PATCH /api/images/products/:imageId/primary - Set image as primary (protected)
router.patch('/products/:imageId/primary', csrfProtection, authenticate, setPrimaryImage);

module.exports = router;
