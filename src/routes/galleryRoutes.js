const express = require('express');
const router = express.Router();
const { createGallery, getAllGallery, deleteGallery, updateGallery } = require('../controllers/galleryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { galleryCreateSchema, galleryUpdateSchema } = require('../validation/schemas');
const csrfProtection = require('../middleware/csrfProtection');

// Protected admin routes - requires authentication
const adminRouter = express.Router();
adminRouter.use(csrfProtection);
adminRouter.use(authenticate);
adminRouter.post('/', validateBody(galleryCreateSchema), createGallery);
adminRouter.get('/', getAllGallery);
adminRouter.delete('/:id', deleteGallery);
router.use('/admin', adminRouter);

// Public routes
router.get('/', getAllGallery);

router.put('/admin/:id', authenticate, csrfProtection, validateBody(galleryUpdateSchema), updateGallery);

module.exports = router;
