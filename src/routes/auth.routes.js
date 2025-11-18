// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// REGISTER (siswi/guru)
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// PROFILE (cek token)
router.get("/profile", authMiddleware, authController.profile);

module.exports = router;
