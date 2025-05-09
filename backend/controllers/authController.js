const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userSignup, sendNewUserMail } = require("../utils/emailNotification");
const { getCoordinates } = require("../utils/coordinates");
// const { clearUserCache } = require('../server');
const NodeCache = require('node-cache')
const myCache = new NodeCache()

const clearUserCache = (userId) => {
    if (!userId) {
        console.warn("[Cache Management] clearUserCache called without a userId.");
        return;
    }
    console.log(`[Cache Management] Clearing cache for user: ${userId}`);
    const keys = myCache.keys();
    const userKeys = keys.filter(key => key.startsWith(`cache::${userId}::`));

    if (userKeys.length > 0) {
        const deleteCount = myCache.del(userKeys);
        console.log(`[Cache Management] Cleared ${deleteCount} cache entries for user: ${userId}`);
    } else {
        console.log(`[Cache Management] No cache entries found for user: ${userId}`);
    }
};


exports.logout = async (req, res) => {
  console.log("Signout request backend");
  try {
    const userId = req.user.id;
    console.log(userId);
    if (userId) {
    clearUserCache(userId);
    console.log(`Cache clear requested and executed for user: ${req.user.id}`);
    res.status(200).json({ message: "User cache cleared successfully" });
    } else {
      console.warn("Cache clear requested but user ID not found on request.");
     res.status(400).json({ message: "Unable to identify user for cache clearing" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

exports.signup = async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    password,
    address, // expects: { street, city, state, zip }
    paymentMethods = [], // optional, can be empty initially
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const addressString = `${address.street}, ${address.city}, ${address.state}`;
    const { lat, lng } = await getCoordinates(addressString);
    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      address,
      latitude: lat,
      longitude: lng,
      pets: [],
      bookings: [],
      consultations: [],
      paymentMethods,
    });
    console.log(user);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    }
    const create = await userSignup(data);
    if (create) {
    const sendMail = await sendNewUserMail(data);
    }
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, name: user.name, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
