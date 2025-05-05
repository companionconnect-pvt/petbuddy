const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from token by verifyToken middleware
    const { petHouseId, petId, serviceType, startDate, endDate, payment } =
      req.body;

    // Optional: Validate input here

    console.log("Creating booking with data:", {
      userId,
      petHouseId,
      petId,
      serviceType,
      startDate,
      endDate,
      payment,
    });

    const newBooking = new Booking({
      userId,
      petHouseId,
      petId,
      serviceType,
      startDate,
      endDate,
      payment,
    });

    await newBooking.save();

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};
