const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console
const translateToSQL = asyncHandler(async (req, res) => {

});




module.exports = {
    translateToSQL,
};