const { GoogleGenerativeAI } = require("@google/genai");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
// Khởi tạo Gemini API với API key
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = "Tell me a story in 300 words";

const result = await model.generateContent(prompt);
console.log(result.response.text());
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
};
