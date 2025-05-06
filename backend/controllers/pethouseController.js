const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PetHouse = require("../models/PetHouse");
const Booking = require("../models/BookingPethouse");

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingPetHouse = await PetHouse.findOne({ email });
    if (existingPetHouse) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPetHouse = new PetHouse({
      name,
      email,
      password: hashedPassword,
    });

    const savedPetHouse = await newPetHouse.save();

    const token = jwt.sign(
      { id: savedPetHouse._id, role: "pethouse" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ token, petHouse: savedPetHouse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    const petHouse = await PetHouse.findOne({ email });
    if (!petHouse)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, petHouse.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: petHouse._id, role: "pethouse" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({ token, petHouse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get PetHouse Profile
const getPetHouseProfile = async (req, res) => {
  console.log("Get PetHouse Profile request initiated");
  console.log("User ID:", req.user.id);
  try {
    const petHouse = await PetHouse.findById(req.user.id);
    if (!petHouse)
      return res.status(404).json({ message: "PetHouse not found" });

    res.status(200).json(petHouse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update PetHouse Profile
const updateProfile = async (req, res) => {
  try {
    const updated = await PetHouse.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Get All PetHouses (Public)
const getAllPetHouses = async (req, res) => {
  // console.log("Fetch all pet houses request initiated method");

  try {
    const petHouses = await PetHouse.find();
    // console.log("Fetched pet houses:", petHouses);
    res.status(200).json(petHouses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pethouses" });
  }
};

// Accept Booking
const acceptBooking = async (req, res) => {
  console.log("Accept booking request initiated", req.params.id, req.user.id);
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.petHouseId.toString() !== req.user.id)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "confirmed";
    await booking.save();

    res.status(200).json({ message: "Booking accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to accept booking" });
  }
};

const getPethouseBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ pethouseId: req.user.id })
      .populate("userId", "name email") // populate user details if needed
      .populate("petId") // optional: populate pet details
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  console.log("Cancel booking request initiated", req.params.id, req.user.id);
  try {
    const booking = await Booking.findById(req.params.id);

    if (
      !booking ||
      !booking.petHouseId ||
      booking.petHouseId.toString() !== req.user.id
    )
      return res.status(404).json({ message: "Booking not found" });

    console.log("Booking found:", booking);
    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// rate pethouse
const ratePetHouse = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.id; // Authenticated user
    const petHouseId = req.params.id;

    const petHouse = await PetHouse.findById(petHouseId);
    if (!petHouse)
      return res.status(404).json({ message: "Pet house not found" });

    // Check if user has already reviewed
    const existingReviewIndex = petHouse.reviews.findIndex(
      (review) => review.userId.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      petHouse.reviews[existingReviewIndex].rating = rating;
      petHouse.reviews[existingReviewIndex].comment = comment;
    } else {
      // Add new review
      petHouse.reviews.push({ userId, rating, comment });
    }

    // Update average rating
    const totalRating = petHouse.reviews.reduce((sum, r) => sum + r.rating, 0);
    petHouse.rating = totalRating / petHouse.reviews.length;

    await petHouse.save();

    res
      .status(200)
      .json({ message: "Review submitted", averageRating: petHouse.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting review" });
  }
};

module.exports = {
  signup,
  login,
  getPetHouseProfile,
  updateProfile,
  getAllPetHouses,
  acceptBooking,
  cancelBooking,
  ratePetHouse,
  getPethouseBookings,
};
