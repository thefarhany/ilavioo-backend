const express = require('express');
const router = express.Router();
const { createInquiry, getPublicInquiries, getAllInquiries, updateInquiry } = require('../controllers/inquiryController');
const { authenticate } = require('../middleware/authMiddleware');
const { inquiryLimiter } = require('../middleware/rateLimiter');
const { validateBody } = require('../middleware/validationMiddleware');
const { inquiryCreateSchema, inquiryUpdateSchema } = require('../validation/schemas');

// Public routes - inquiry creation has stricter rate limiting
router.post('/', inquiryLimiter, validateBody(inquiryCreateSchema), createInquiry);
router.get('/', getPublicInquiries);

// Protected admin routes - requires authentication
const adminRouter = express.Router();
adminRouter.use(authenticate);
adminRouter.get('/', getAllInquiries);
adminRouter.put('/:id', validateBody(inquiryUpdateSchema), updateInquiry);
router.use('/admin', adminRouter);

module.exports = router;
