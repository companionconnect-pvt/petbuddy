const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage — fields only

const driverController = require('../controllers/driverController');
const verifyToken = require('../middlewares/auth'); // ensure this middleware is in place for token validation

// Handle multipart/form-data with file fields and text fields
const driverUpload = upload.fields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'adharPhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 },
]);

// Route for signing up a driver
router.post('/signup', driverUpload, driverController.signup);

// Route for driver login 
router.post('/login', driverController.login);

// Route for updating a driver's information
router.put('/me', driverController.updateDriver);

// Route for fetching the current driver's details
router.get("/me", verifyToken, driverController.getCurrentDriver);

module.exports = router;
