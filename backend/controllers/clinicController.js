const PetClinic = require("../models/PetClinic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      address,
      openingHours,
      registeredName,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "License file is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "clinic_licenses",
      resource_type: "auto",
    });

    const fileType = result.format;
    if (!["pdf", "jpg", "jpeg", "png"].includes(fileType)) {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const existing = await PetClinic.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Clinic already registered with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClinic = new PetClinic({
      name,
      email,
      password: hashedPassword,
      phone,
      license: {
        url: result.secure_url,
        fileType,
      },
      specialization,
      experience,
      clinicAddress: {
        address,
        openingHours,
        registeredName,
      },
    });

    await newClinic.save();

    const token = jwt.sign({ id: newClinic._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Clinic registered successfully",
      clinic: {
        id: newClinic._id,
        name: newClinic.name,
        email: newClinic.email,
        license: newClinic.license,
      },
      token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clinic = await PetClinic.findOne({ email });

    if (!clinic) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, clinic.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: clinic._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      clinic: {
        id: clinic._id,
        name: clinic.name,
        email: clinic.email,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
