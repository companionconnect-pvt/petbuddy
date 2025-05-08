const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

router.post("/send", async (req, res) => {
  try {
    const { ticketId, encryptedMessage, senderName, senderId } = req.body;

    if (!ticketId || !encryptedMessage || !senderName || !senderId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const chatMessage = new Chat({
      ticketId,
      encryptedMessage,
      senderName,
      senderId
    });

    await chatMessage.save();

    res.json({ success: true, chatMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.get("/:ticketId", async (req, res) => {
  try {
    const messages = await Chat.find({ ticketId: req.params.ticketId }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
