const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { categoryCreateSchema } = require('../validation/schemas');

// Protected routes - only authenticated admin can manage categories
router.post('/', authenticate, validateBody(categoryCreateSchema), createCategory);
router.get('/', getAllCategories);
router.put('/:id', authenticate, validateBody(categoryCreateSchema), updateCategory);
router.delete('/:id', authenticate, deleteCategory);

module.exports = router;
