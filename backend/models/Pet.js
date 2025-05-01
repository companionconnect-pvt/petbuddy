const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female"], 
      default: "Male"
    },

    medicalHistory: [
      {
        date: { type: Date, required: true },
        description: { type: String, required: true },
        doctor: { type: String, required: true }, // e.g., the vet's name or clinic
        treatment: { type: String } // Optional, details of the treatment
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
