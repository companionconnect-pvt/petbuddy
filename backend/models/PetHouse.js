const mongoose = require("mongoose");

const petHouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    services: [{ type: String }],
    pricing: {
      boarding: { type: Number, default: 0 },
      grooming: { type: Number, default: 0 },
      daycare: { type: Number, default: 0 },
    },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Use module.exports to export the PetHouse model
module.exports = mongoose.model("PetHouse", petHouseSchema);
