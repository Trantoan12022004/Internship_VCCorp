const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Import GoogleGenerativeAI
const { GoogleGenerativeAI } = require("@google/genai");

// Khởi tạo Gemini API với API key từ environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);




const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,

};