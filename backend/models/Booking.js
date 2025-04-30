const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petHouseId: { type: mongoose.Schema.Types.ObjectId, ref: "PetHouse", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },

    serviceType: [
      {
        name: { type: String, required: true }, // e.g., "boarding"
        petType: { type: String },              // e.g., "small dog"
        price: { type: Number }                 // optional, to store snapshot at booking time
      }
    ],

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },

    payment: {
      amount: { type: Number, required: true },
      method: { type: String, enum: ["upi", "card", "cash"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
