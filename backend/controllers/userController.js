const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Pet = require('../models/Pet'); 
const Booking = require('../models/BookingPethouse');
const Consultation = require("../models/Consultation"); 
const { updateUserData } = require("../utils/emailNotification");
const { getCoordinates } = require("../utils/coordinates");

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
      console.log(updates);
      const addressString = `${updates.address.street}, ${updates.address.city}, ${updates.address.state}`;
      const { lat, lng } = await getCoordinates(addressString);
      const newUpdate = {
        name:updates.name,
        email:updates.email,
        phoneNumber:updates.phoneNumber,
        address: {
          street: updates.address.street,
          city: updates.address.city,
          state: updates.address.state,
          zip: updates.address.zip,
        },
        latitude:lat,
        longitude:lng,
      };
      const updateUser = await User.findByIdAndUpdate(req.user.id, newUpdate);
      const data = {
        _id: user._id,
        name: updates.name,
        email: updates.email,
        phoneNumber: updates.phoneNumber,
      }
      const updateContact = await updateUserData(data);
      res.status(200).json(user);
  } catch(error) {
    console.error("Error fetching user data", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getCurrentUser, updateCurrentUser };
