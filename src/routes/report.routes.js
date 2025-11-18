const express = require('express');
const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');
const permit = require('../middlewares/role.middleware');

const router = express.Router();

// All report endpoints require guru role
router.get('/daily', auth, permit('guru', 'admin'), reportController.getDailyReport);
router.get('/weekly', auth, permit('guru', 'admin'), reportController.getWeeklyReport);
router.get('/per-class', auth, permit('guru', 'admin'), reportController.getPerClassReport);

module.exports = router;
