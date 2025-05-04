const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    petHouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetHouse",
    },

    type: {
      type: String,
      enum: ["pickup", "dropoff"], // pickup from user or pet house
      required: true,
    },

    fromLocation: {
      lat: Number,
      lng: Number,
      address: String,
    },
    toLocation: {
      lat: Number,
      lng: Number,
      address: String,
    },

    status: {
      type: String,
      enum: ["assigned", "enroute", "pickedUp", "completed", "cancelled"],
      default: "assigned",
    },

    startedAt: { type: Date },
    completedAt: { type: Date },

    distanceKm: Number,
    estimatedTimeMin: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
