const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getConfirmedBookingsWithoutDriver,
  rescheduleAppointment,
  deleteUsingId,
} = require("../controllers/bookingController");

const verifyToken = require("../middlewares/auth");

// Create a new booking
router.post("/createBooking", verifyToken, createBooking);

// Get all bookings (filtered by user or pet house based on role)
router.get("/all", verifyToken, getAllBookings);

router.get(
  "/confirmed-without-driver",
  verifyToken,
  getConfirmedBookingsWithoutDriver
);

// Get booking by ID
router.get("/:id", verifyToken, getBookingById);

// Update booking status (only allowed by pet house)
router.patch("/:id/status", verifyToken, updateBookingStatus);

router.put("/:id/reschedule", verifyToken, rescheduleAppointment);
router.delete("/:id", verifyToken, deleteUsingId);

module.exports = router;
