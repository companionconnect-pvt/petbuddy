const mongoose = require("mongoose");

const petClinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },

    license: {
      url: { type: String, required: true }, // Cloudinary URL
      fileType: {
        type: String,
        enum: ["pdf", "jpg", "jpeg", "png"],
        required: true,
      },
    },

    specialization: { type: String, required: true },
    experience: { type: Number, required: true }, // in years
    address: { 
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    clinicAddress: {
      amount: { type: Number, required: true, default: 0 },
      openingHours: { type: String, required: true }, // e.g., "9am - 5pm"
      closingHours: { type: String, required: true },
      registeredName: { type: String, required: true },
    },

    consultations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Consultation" },
    ],

    rating: { type: Number, default: 0 },
    availability: [{ type: Date }], // available appointment slots
  },
  { timestamps: true }
);

module.exports = mongoose.model("PetClinic", petClinicSchema);
