const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
    model: "gemini-1.5-flash", // Hoặc model nào hoạt động từ kết quả test
    contents: "Hello! Please respond to confirm that the API is working correctly.",
console.log(response);
const translateToSQL = asyncHandler(async (req, res) => {});

module.exports = {
    translateToSQL,
};
