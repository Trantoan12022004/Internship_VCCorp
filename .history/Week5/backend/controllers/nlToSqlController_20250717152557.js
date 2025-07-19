const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Import GoogleGenerativeAI
const { GoogleGenerativeAI } = require("@google/genai");

// Khởi tạo Gemini API với API key từ environment
const genAI = new GoogleGenerativeAI({ apiKey: "GOOGLE_API_KEY" });

const ai = new GoogleGenAI({ apiKey: "GOOGLE_API_KEY" });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Tell me a story in 300 words.",
});
console.log(response.text);


const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,

};