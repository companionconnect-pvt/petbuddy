const express = require("express");
const { signup, login, getPetHouseProfile } = require("../controllers/pethouseController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

// PetHouse Signup Route
router.post("/signup", signup);

// PetHouse Login Route
router.post("/login", login);

// Protected Route: Get PetHouse Profile
router.get("/profile", verifyToken, getPetHouseProfile); // Protected route with JWT middleware

module.exports = router; // Use module.exports instead of export default
