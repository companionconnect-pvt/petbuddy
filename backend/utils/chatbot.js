// backend/utils/chatbot.js
const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDIxn3PMZT5K-ZEq-HcpgzyURFqdM_1dws";

const ai = new GoogleGenAI({apiKey : GEMINI_API_KEY});

async function getChatbotReply(prompt) {
    try{
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
    });
    return response.text;
    } catch (error) {
    console.error("Error generating content:", error);
    throw error;
    }
}


module.exports = { getChatbotReply };