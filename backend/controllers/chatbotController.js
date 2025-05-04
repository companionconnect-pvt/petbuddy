const Pet = require("../models/Pet");
const ChatBotMessage = require("../models/ChatBotMessage");
const { getChatbotReply } = require("../utils/chatbot");


const chatBotMessage = async(req, res) => {
    try {
        const { petId, message } = req.body;
        if (!message || !petId) {
            return res.status(400).json({ error: "Missing petId or message" });
        }

        const pet = await Pet.findById(petId).populate("medicalHistory"); 
    if (!pet) return res.status(404).json({ error: "Pet not found" });

    // Build medical history string
    const historyText = pet.medicalHistory && pet.medicalHistory.length > 0
      ? pet.medicalHistory.map(entry => {
          return `• ${entry.date}: ${entry.diagnosis} (${entry.treatment})`;
        }).join("\n")
      : "No medical history available.";

        const saveUserMessage = await ChatBotMessage.create({
            pet: pet._id,
            from: "user",
            message: message,
        });

    // Compose the chatbot prompt
    const prompt = `
        You are a helpful pet care assistant. Here's the pet's info:
        - Name: ${pet.name}
        - Breed: ${pet.breed}
        - Age: ${pet.age}
        - Medical History:
        ${historyText}

        User message: "${message}"

        Respond with a helpful, friendly, and concise answer.
        `;
        const reply = await getChatbotReply(prompt);

        const saveBotMessage = await ChatBotMessage.create({
            pet: pet._id,
            from: "bot",
            message: reply,
        });
        return res.status(200).json({ reply });
    }
    catch (error) {
        console.error("Chatbot error", error);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllChatBotMesssages = async(req,res) => {
    try {
        const petId = req.params.petId;
        const messages = await ChatBotMessage.find({ pet : petId }).sort({ timestamp : 1 });
        res.status(200).json({ history : messages });
    } catch(error) {
        console.error("Database error", error);
        res.status(500).json({ error : "Server error" });
    }
}

module.exports = { chatBotMessage, getAllChatBotMesssages }