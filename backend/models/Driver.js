const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  vehicle: {
    type: {
      vehicleType: { type: String, required: true },
      vehicleModel: { type: String, required: true },
      vehicleNumber: { type: String, required: true },
      vehicleCapacity: { type: Number, required: true },
      vehiclePhoto: { type: String },
    },
    required: true,
  },
  license: {
    number: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    photoUrl: { type: String },
  },
  adharCard: {
    adharNumber: { type: String, required: true },
    photoUrl: { type: String },
  },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  currentLocation: { type: [Number], required: true }, // [latitude, longitude]
  assignedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
  completedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
  totalEarnings: { total: { type: Number, default: 0 }, currency: { type: String, default: 'INR' }, lastPayouts: { type: Date } },
  availability: { type: String, enum: ['available', 'busy'], default: 'available' },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Driver', driverSchema);
