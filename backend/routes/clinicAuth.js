const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const clinicController = require("../controllers/clinicController");
const verifyToken = require("../middlewares/auth");

router.post("/signup", upload.single("license"), clinicController.signup);
router.post("/login", clinicController.login);
router.get("/", clinicController.fetchAllClinics);
router.get("/profile", verifyToken, clinicController.getClinicProfile);
router.put("/profile", verifyToken, clinicController.updateClinicProfile)

module.exports = router;
