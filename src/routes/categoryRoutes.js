const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { categoryCreateSchema } = require('../validation/schemas');
const csrfProtection = require('../middleware/csrfProtection');

// Protected routes - only authenticated admin can create categories
router.post('/', csrfProtection, authenticate, validateBody(categoryCreateSchema), createCategory);

// Public routes
router.get('/', getAllCategories);

router.put('/:id', authenticate, csrfProtection, validateBody(categoryCreateSchema), updateCategory);
router.delete('/:id', authenticate, csrfProtection, deleteCategory);

module.exports = router;
