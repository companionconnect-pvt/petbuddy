const Booking = require("../models/BookingPethouse");
const User = require("../models/User");
const Pet = require("../models/Pet");
const { sendBookingConfirmation } = require("../utils/emailNotification");

// 1. Create a booking (already implemented)

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.body);

    const {
      petHouseId,
      petId,
      serviceType,
      startDate,
      endDate,
      payment,
      source,
      destination,
    } = req.body;

    const newBooking = new Booking({
      userId,
      petHouseId,
      petId,
      serviceType,
      startDate,
      endDate,
      payment,
      source,
      destination,
    });

    await newBooking.save();
    const updateUserBookings = await User.findByIdAndUpdate(userId, {
      $push: { bookings: newBooking._id },
    });
    const user = await User.findById(userId);
    const pet = await Pet.findById(petId);
    const data = {
      _id: userId,
      userName: user.name,
      email: user.email,
      petName: pet.name,
      startDate: startDate,
      endDate: endDate,
      service: serviceType[0].name,
    };
    const sendMail = await sendBookingConfirmation(data);
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

// 2. Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const filter =
      role === "pethouse" ? { petHouseId: userId } : { userId: userId };

    const bookings = await Booking.find(filter)
      .populate("userId", "name email phoneNumber")
      .populate("petHouseId", "name email")
      .populate("petId", "name type breed species age");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error while fetching bookings" });
  }
};

// 3. Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate("petHouseId", "name email")
      .populate("petId", "name type breed");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server error while fetching booking" });
  }
};

// 4. Update booking status (only PetHouse can do this)
exports.updateBookingStatus = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { status } = req.body;

    if (role !== "pethouse") {
      return res
        .status(403)
        .json({ message: "Only PetHouses can update status" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      petHouseId: userId,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Status updated", booking });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res
      .status(500)
      .json({ message: "Server error while updating booking status" });
  }
};
exports.getConfirmedBookingsWithoutDriver = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "confirmed",
      isDriverAssigned: false,
    })
      .populate("userId", "name email")
      .populate("petHouseId", "name")
      .populate("petId", "name type");

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Server error while fetching bookings." });
  }
};

exports.markBookingCompleted = async (req, res) => {
  console.log(
    "Attempting to mark booking as completed with ID:",
    req.params.id
  );
  try {
    const role = req.user.role;
    const userId = req.user.id; // ID of the authenticated user (PetHouse)
    const bookingId = req.params.id;
    const { notes, treatment } = req.body; // Get completion details from body

    // Ensure only PetHouses can mark bookings as completed
    if (role !== "pethouse") {
      return res
        .status(403)
        .json({ message: "Only PetHouses can mark bookings as completed" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
    });

    // Check if the booking exists
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or not authorized to update" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: `Booking cannot be marked as completed in status: ${booking.status}`,
      });
    }

    booking.status = "completed";
    if (notes !== undefined) {
      booking.notes = notes;
    }
    if (treatment !== undefined) {
      booking.treatment = treatment;
    }

    await booking.save();

    res.status(200).json({ message: "Booking marked as completed", booking });
  } catch (err) {
    console.error("Error marking booking as completed:", err);
    res
      .status(500)
      .json({ message: "Server error while marking booking as completed" });
  }
};

exports.deleteUsingId = async (req, res) => {
  console.log("Deleting booking with ID:", req.params.id);
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status === "confirmed") {
      return res.status(400).json({ error: "Cannot cancel confirmed booking" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  console.log("Rescheduling booking with ID:", req.params.id);
  const { startDate, endDate } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const now = new Date();
    const start = new Date(booking.startDate);
    const daysBefore = (start - now) / (1000 * 60 * 60 * 24);

    if (booking.status === "confirmed" && daysBefore < 2) {
      return res
        .status(400)
        .json({ error: "Too late to reschedule confirmed booking" });
    }

    // Validate new dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    booking.startDate = new Date(startDate);
    booking.endDate = new Date(endDate);
    await booking.save();

    res.status(200).json({ message: "Booking rescheduled" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
