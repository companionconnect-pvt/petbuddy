const express = require("express");
const {
  signup,
  login,
  getPetHouseProfile,
  updateProfile,
  getAllPetHouses,
  acceptBooking,
  cancelBooking,
} = require("../controllers/pethouseController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected Routes
router.get("/profile", verifyToken, getPetHouseProfile);
router.patch("/update", verifyToken, updateProfile);
router.get("/", getAllPetHouses);
router.patch("/booking/:id/accept", verifyToken, acceptBooking);
router.patch("/booking/:id/cancel", verifyToken, cancelBooking);

module.exports = router;
