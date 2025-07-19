const { GoogleGenerativeAI } = require("@google/genai");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
// Khởi tạo Gemini API với API key
console.log("check API", process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API initialized with provided API key.", genAI);
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
};
