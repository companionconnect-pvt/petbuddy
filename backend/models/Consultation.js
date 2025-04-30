const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petClinicId: { type: mongoose.Schema.Types.ObjectId, ref: "PetClinic", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },

    appointmentDate: { type: Date, required: true },

    mode: {
      type: String,
      enum: ["inperson", "videocall"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },

    notes: { type: String },

    payment: {
      amount: { type: Number, required: true },
      method: { type: String, enum: ["upi", "card", "cash"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);
