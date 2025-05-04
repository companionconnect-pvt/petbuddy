const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  from: { type: String, enum: ["user", "bot"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatBotMessage", chatMessageSchema);
