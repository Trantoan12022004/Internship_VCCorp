const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("express-async-handler");

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API initialized with provided API key.");
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
};
