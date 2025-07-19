const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("Google GenAI initialized with API key", ai);

const translateToSQL = asyncHandler(async (req, res) => {

});

// Hàm test API


module.exports = {
    translateToSQL,
};