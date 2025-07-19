const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await genAI.models.generateContent({
    model: "gemini-pro",
    contents: "Say hello and confirm you're working!",
});
console
const translateToSQL = asyncHandler(async (req, res) => {});

module.exports = {
    translateToSQL,
};
