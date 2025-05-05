const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} = require("../controllers/bookingController");

const verifyToken = require("../middlewares/auth");

// Create a new booking
router.post("/createBooking", verifyToken, createBooking);

// Get all bookings (filtered by user or pet house based on role)
router.get("/all", verifyToken, getAllBookings);

// Get booking by ID
router.get("/:id", verifyToken, getBookingById);

// Update booking status (only allowed by pet house)
router.patch("/:id/status", verifyToken, updateBookingStatus);

module.exports = router;
