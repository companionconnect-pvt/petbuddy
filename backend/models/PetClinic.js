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

    clinicAddress: {
      address: { type: String, required: true },
      openingHours: { type: String, required: true }, // e.g., "9am - 5pm"
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
