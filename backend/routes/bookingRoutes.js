const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookingController");
const verifyToken = require("../middlewares/auth");

router.post("/createBooking", verifyToken, createBooking);

module.exports = router;
