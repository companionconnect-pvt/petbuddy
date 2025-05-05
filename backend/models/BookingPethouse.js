const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetHouse",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },

    serviceType: [
      {
        name: { type: String, required: true },
        petType: { type: String },
        price: { type: Number },
      },
    ],

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    payment: {
      amount: { type: Number, required: true },
      method: { type: String, enum: ["upi", "card", "cash"], required: true },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },

    source: {
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
      },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    destination: {
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
      },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
