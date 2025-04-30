const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage — fields only

const driverController = require('../controllers/driverController');

// Handle multipart/form-data with file fields and text fields
const driverUpload = upload.fields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'adharPhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 },
]);

router.post('/signup', driverUpload, driverController.signup);
router.post('/login', driverController.login);
router.put('/update/:id', driverController.updateDriver);
module.exports = router;
