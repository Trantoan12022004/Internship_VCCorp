const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Import GoogleGenerativeAI
const { GoogleGenerativeAI } = require("@google/genai");

// Khởi tạo Gemini API với API key từ environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const testGemini = asyncHandler(async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Tell me a story in 300 words.";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({
            success: true,
            data: text
        });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            success: false,
            message: "Error calling Gemini API",
            error: error.message
        });
    }
});


const translateToSQL = asyncHandler(async (req, res) => {

});

module.exports = {
    translateToSQL,
    testGemini
};