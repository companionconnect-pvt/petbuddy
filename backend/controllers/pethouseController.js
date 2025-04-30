const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PetHouse = require("../models/PetHouse");

// JWT Secret (use your .env in real app)
const JWT_SECRET = "Yg#8s9iFgT!pM2nA5w@QeZ6rLp^RtZ3k";

// PetHouse Signup controllers
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, address, services, pricing } = req.body;

    // Check if PetHouse already exists
    const existingPetHouse = await PetHouse.findOne({ email });
    if (existingPetHouse) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new PetHouse
    const newPetHouse = new PetHouse({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      services,
      pricing,
    });

    const savedPetHouse = await newPetHouse.save();

    // Create JWT Token
    const token = jwt.sign({ id: savedPetHouse._id, role: "pethouse" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, petHouse: savedPetHouse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PetHouse Login controllers
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const petHouse = await PetHouse.findOne({ email });
    if (!petHouse) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, petHouse.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT Token
    const token = jwt.sign({ id: petHouse._id, role: "pethouse" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token, petHouse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get PetHouse Profile (Protected Route)
const getPetHouseProfile = async (req, res) => {
  try {
    const petHouse = await PetHouse.findById(req.user.id); // req.user comes from the middleware
    if (!petHouse) {
      return res.status(404).json({ message: "PetHouse not found" });
    }

    res.status(200).json(petHouse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, getPetHouseProfile }; // Use module.exports to export controllers
