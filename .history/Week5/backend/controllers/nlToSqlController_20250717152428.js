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
    try {
        const { naturalLanguage, schema } = req.body;
        
        if (!naturalLanguage) {
            return res.status(400).json({
                success: false,
                message: "Natural language query is required"
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
        Convert the following natural language query to SQL:
        
        Natural Language: "${naturalLanguage}"
        
        ${schema ? `Database Schema: ${schema}` : ''}
        
        Please provide only the SQL query without explanation.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const sqlQuery = response.text();
        
        res.json({
            success: true,
            data: {
                naturalLanguage,
                sqlQuery: sqlQuery.trim(),
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error translating to SQL",
            error: error.message
        });
    }
});

module.exports = {
    translateToSQL,
    testGemini
};