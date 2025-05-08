const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petClinicId: { type: mongoose.Schema.Types.ObjectId, ref: "PetClinic", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },

    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },

    mode: {
      type: String,
      enum: ["In-Person", "Video-Call", "video-call", "in-person"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },

    notes: { type: String },

    payment: {
      amount: { type: Number, required: true, default: 0 },
      method: { type: String, enum: ["upi", "card", "cash", "UPI", "Card", "Cash"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
    },
    source: {
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
      },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    destination: {
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
      },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    driverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Driver",
          default: null, // Initially no driver assigned
        },
        isDriverAssigned: {
          type: Boolean,
          default: false,
        },
  },
  { timestamps: true, default: Date.now }
);

module.exports = mongoose.model("Consultation", consultationSchema);
