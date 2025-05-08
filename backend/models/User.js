const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  latitude: { type: Number},
  longitude: { type: Number },
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Consultation"}],
  paymentMethods: [{
    methodType: { type: String }, // e.g., 'UPI', 'Card'
    details: { type: String },    // e.g., UPI ID or masked card number
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
