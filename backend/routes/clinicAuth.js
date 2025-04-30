const express = require("express");
const router = express.Router();
const multer = require("multer");
const clinicController = require("../controllers/clinicController");

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });

router.post("/signup", upload.single("license"), clinicController.signup);
router.post("/login", clinicController.login);

module.exports = router;
