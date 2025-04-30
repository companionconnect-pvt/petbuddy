const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { _id: false });

const petTransportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },

    pickupLocation: { type: locationSchema, required: true },
    dropoffLocation: { type: locationSchema, required: true },

    pickupTime: { type: Date, required: true },

    deliveryStatus: {
      type: String,
      enum: ["scheduled", "in_transit", "delivered", "cancelled"],
      default: "scheduled"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PetTransport", petTransportSchema);
