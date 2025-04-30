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
    services: [
      {
        name: { type: String, required: true }, // e.g., "boarding"
        options: [
          {
            petType: { type: String, required: true }, // e.g., "small dog"
            price: { type: Number, required: true }
          }
        ]
      }
    ],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PetHouse", petHouseSchema);
