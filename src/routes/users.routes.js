const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const User = require("../models/User");

// GET /api/users?siswi=true  => ambil user dengan role=siswi jika query siswi=true, admin & guru bisa akses
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["guru", "admin"]),
  async (req, res) => {
    try {
      const { siswi } = req.query;
      let filter = {};
      if (siswi === "true") {
        filter.role = "siswi";
      }
      const users = await User.find(filter).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
