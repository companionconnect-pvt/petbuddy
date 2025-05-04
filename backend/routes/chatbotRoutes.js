const express = require("express");
const { chatBotMessage, getAllChatBotMesssages } = require("../controllers/chatbotController");
const verifyToken = require("../middlewares/auth");

const router = express.Router();

router.post("/", verifyToken, chatBotMessage);

router.get("/:petId", getAllChatBotMesssages);

module.exports = router;
