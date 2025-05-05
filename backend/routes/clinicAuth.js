const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const clinicController = require("../controllers/clinicController");

router.post("/signup", upload.single("license"), clinicController.signup);
router.post("/login", clinicController.login);
router.get("/", clinicController.fetchAllClinics);

module.exports = router;
