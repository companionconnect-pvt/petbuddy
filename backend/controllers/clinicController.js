const PetClinic = require("../models/PetClinic");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const { getCoordinates } = require("../utils/coordinates");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      street,
      city,
      state,
      zip,
      openingHours,
      closingHours,
      registeredName,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "License file is required" });
    }

    // Convert buffer to base64 string
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
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
    const addressString = `${street}, ${city}, ${state}`;
    const { lat, lng } = await getCoordinates(addressString);
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
      address : {
        street,
        city,
        state,
        zip,
      },
      latitude: lat,
      longitude: lng,
      clinicAddress: {
        openingHours,
        closingHours,
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

    const token = jwt.sign({ id: clinic._id, name: clinic.name, role: "clinic" }, process.env.JWT_SECRET, {
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

exports.fetchAllClinics = async (req, res) => {
  try {
    const clinics = await PetClinic.find(); // optional sorting by newest

    res.status(200).json(clinics);
  } catch (err) {
    console.error("Fetch Clinics Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getClinicProfile = async(req, res) => {
  try {
    const petClinicId = req.user.id;
    const clinic = await PetClinic.findById(petClinicId);
    if (!clinic)
      return res.status(404).json({ message: "PetClinic not found" });

    res.status(200).json(clinic);

  } catch (error) {
    console.error("Error fetching profile data: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateClinicProfile = async (req, res) => {
  try {
    const petClinicId = req.user.id;
    
    // Validate required fields
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    // Find clinic first to ensure it exists
    const clinic = await PetClinic.findById(petClinicId).select('-password');
    if (!clinic) {
      return res.status(404).json({ message: "Pet Clinic not found" });
    }

    // Prepare updates object
    const updates = {};
    const allowedFields = [
      'name', 'email', 'phone', 'specialization', 'experience', 
      'address', 'clinicAddress'
    ];

    // Validate and process updates
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'address') {
          updates.address = {
            ...clinic.address,
            ...req.body.address
          };
        } else if (field === 'clinicAddress') {
          updates.clinicAddress = {
            ...clinic.clinicAddress,
            ...req.body.clinicAddress
          };
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    // Handle geocoding if address changed
    if (req.body.address) {
      try {
        const addressString = `${updates.address.street}, ${updates.address.city}, ${updates.address.state}`;
        const { lat, lng } = await getCoordinates(addressString);
        updates.latitude = lat;
        updates.longitude = lng;
      } catch (geocodeError) {
        console.error("Geocoding failed:", geocodeError);
        // Continue without failing - just don't update coordinates
      }
    }

    // Perform the update
    const updatedClinic = await PetClinic.findByIdAndUpdate(
      petClinicId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedClinic) {
      return res.status(500).json({ message: "Update failed" });
    }

    res.status(200).json({
      success: true,
      data: updatedClinic
    });

  } catch (error) {
    console.error("Error updating clinic profile:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation failed",
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
};
