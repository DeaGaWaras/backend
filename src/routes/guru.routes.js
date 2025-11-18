// src/routes/guru.routes.js
const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guru.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, guruController.listGurus);

module.exports = router;
