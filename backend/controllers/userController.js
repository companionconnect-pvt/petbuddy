const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Pet = require('../models/Pet'); 
const Booking = require('../models/BookingPethouse');
const Consultation = require("../models/Consultation"); 
const { updateUserData } = require("../utils/emailNotification");

const JWT_SECRET = "Yg#8s9iFgT!pM2nA5w@QeZ6rLp^RtZ3k";

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    .populate("pets")
    .populate("bookings")
    .populate("consultations");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCurrentUser = async(req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const updates = req.body;

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const updateUser = await User.findByIdAndUpdate(req.user.id, updates);
        const data = {
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        }
        const updateContact = await updateUserData(data);
        res.status(200).json(user);
    } catch(error) {
      console.error("Error fetching user data", error);
      res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getCurrentUser, updateCurrentUser };
