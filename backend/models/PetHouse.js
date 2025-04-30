const mongoose = require("mongoose");

const petHouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    services: [
      {
        name: { type: String }, // e.g., "boarding"
        options: [
          {
            petType: { type: String }, // e.g., "small dog"
            price: { type: Number }
          }
        ]
      }
    ],
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        comment: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    rating: { type: Number, default: 0 }, // Average of all review ratings
  },
  { timestamps: true }
);

module.exports = mongoose.model("PetHouse", petHouseSchema);
