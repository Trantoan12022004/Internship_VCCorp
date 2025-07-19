const { GoogleGenerativeAI } = require("@google/genai");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
// Khởi tạo Gemini API với API key

const ai = new GoogleGenerativeAI({ apiKey: "GOOGLE_API_KEY" });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Tell me a story in 300 words.",
});
console.log(response.text);
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
};
