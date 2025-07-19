const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Import GoogleGenerativeAI
const { GoogleGenerativeAI } = require("@google/genai");

// Khởi tạo Gemini API với API key từ environment
const genAI = new GoogleGenerativeAI({ apiKey: "AAIzaSyC5yLV0d6dZqGi-S7JWo68zyqd0Jjo6n9g" });


const response = ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Tell me a story in 300 words.",
});
console.log(response.text);


const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,

};