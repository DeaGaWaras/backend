// src/routes/absen.routes.js
const express = require("express");
const router = express.Router();
const AbsenController = require("../controllers/absen.controller");
const auth = require("../middlewares/auth.middleware");
const permit = require("../middlewares/role.middleware");

// create absen (siswi)
router.post(
  "/",
  auth,
  permit("siswi", "guru", "admin"),
  AbsenController.createAbsen
);

// list Absens (admin/guru get all; siswi own only)
router.get("/", auth, AbsenController.getAll);

// get aggregated haid data (MUST BE BEFORE /:id)
router.get(
  "/haid/aggregate",
  auth,
  permit("guru", "admin"),
  AbsenController.getHaidAggregate
);

// get single absen
router.get("/:id", auth, AbsenController.getOne);

// delete absen
router.delete(
  "/:id",
  auth,
  permit("siswi", "admin", "guru"),
  AbsenController.deleteAbsen
);

// generate pdf
router.get(
  "/:id/pdf",
  auth,
  permit("siswi", "guru", "admin"),
  AbsenController.generatePdf
);

module.exports = router;
