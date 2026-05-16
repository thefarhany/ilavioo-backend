const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { authenticate } = require('../middleware/authMiddleware');
const csrfProtection = require('../middleware/csrfProtection');

router.get('/dashboard', csrfProtection, authenticate, getDashboardStats);

module.exports = router;
