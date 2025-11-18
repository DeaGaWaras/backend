const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

// Get dashboard stats (guru/admin only)
router.get('/stats', auth, dashboardController.getStats);

module.exports = router;
