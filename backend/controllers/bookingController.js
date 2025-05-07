const Booking = require("../models/BookingPethouse");
const User = require("../models/User");

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
      .populate("userId", "name email")
      .populate("petHouseId", "name email")
      .populate("petId", "name type breed");

    res.status(200).json({ bookings });
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
