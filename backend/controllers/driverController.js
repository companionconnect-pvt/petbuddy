
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver'); // adjust path if needed
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'yoursecretkey';
const cloudinary = require("../utils/cloudinary");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      vehicleCapacity,
      licenseNumber,
      licenseExpiry,
      adharNumber,
      // currentLatitude,
      // currentLongitude,
    } = req.body;

    // Check for uploaded files
    if (!req.files || !req.files.licensePhoto || !req.files.adharPhoto || !req.files.vehiclePhoto) {
      return res.status(400).json({ message: "License, Aadhaar, and Vehicle photos are required" });
    }

    const uploadToCloudinary = async (file, folder) => {
      const base64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: "auto",
      });
      // console.log(secure_url);
      return result.secure_url;
    };
    // const result = await cloudinary.uploader.upload(dataUri, {
    //       folder: "clinic_licenses",
    //       resource_type: "auto",
    //     });
    
    const [licensePhotoUrl, adharPhotoUrl, vehiclePhotoUrl] = await Promise.all([
      uploadToCloudinary(req.files.licensePhoto[0], "driver_licenses"),
      uploadToCloudinary(req.files.adharPhoto[0], "driver_adhar"),
      uploadToCloudinary(req.files.vehiclePhoto[0], "vehicle_photos"),
    ]);
    // console.log(licensePhotoUrl);
    // Check if driver already exists
    const existing = await Driver.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Driver already registered with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDriver = new Driver({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      vehicle: {
        vehicleType,
        vehicleModel,
        vehicleNumber,
        vehicleCapacity,
        vehiclePhoto: vehiclePhotoUrl,
      },
      license: {
        number: licenseNumber,
        expiryDate: licenseExpiry,
        photoUrl: licensePhotoUrl,
      },
      adharCard: {
        adharNumber,
        photoUrl: adharPhotoUrl,
      },
      
    });

    await newDriver.save();

    const token = jwt.sign({ id: newDriver._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Driver registered successfully",
      driver: {
        id: newDriver._id,
        name: newDriver.name,
        email: newDriver.email,
        vehicle: newDriver.vehicle,
      },
      token,
    });
  } catch (err) {
    console.error("Driver Signup Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
   const { email, password } = req.body;
   
       const driver = await Driver.findOne({ email });
       if (!driver) {
         return res.status(400).json({ message: "Invalid credentials" });
       }
   
       // Compare passwords
       const isMatch = await bcrypt.compare(password, driver.passwordHash);
       if (!isMatch) {
         return res.status(400).json({ message: "Invalid credentials" });
       }
   
       // Create JWT Token
       const token = jwt.sign({ id: driver._id, role: "driver" }, JWT_SECRET, {
         expiresIn: "7d",
       });
   
       res.status(200).json({ token, driver });
     } catch (err) {
       console.error(err);
       res.status(500).json({ message: "Server error" });
     }
};
exports.updateDriver = async (req, res) => {
  const { id } = req.params; // or req.body.id
  const updates = req.body;

  try {
    const updatedDriver = await Driver.findByIdAndUpdate(id, updates, {
      new: true, // returns the updated document
      runValidators: true,
    });

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver updated successfully", driver: updatedDriver });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
