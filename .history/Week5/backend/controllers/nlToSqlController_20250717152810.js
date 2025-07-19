const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Import GoogleGenerativeAI với cú pháp CommonJS
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini API với API key từ environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API initialized");

// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;
    console.log("Received text for translation:", text);
    
    if (!text) {
      return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
    }
    
    // Khởi tạo model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Tạo prompt
    const prompt = `
      Chuyển đổi câu hỏi sau đây thành câu lệnh SQL:
      "${text}"
      
      Chỉ trả về câu lệnh SQL hoàn chỉnh, không kèm theo giải thích.
    `;
    
    // Gọi API để sinh nội dung
    const result = await model.generateContent(prompt);
    const response = result.response;
    const sqlQuery = response.text();
    
    console.log("Generated SQL:", sqlQuery);
    
    return res.status(200).json({
      success: true,
      query: sqlQuery,
      originalText: text
    });
  } catch (error) {
    console.error("Error in translateToSQL:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý yêu cầu",
      error: error.message
    });
  }
});

// @desc    Test kết nối Gemini API
// @route   GET /api/nlsql/test
// @access  Public
const testGeminiConnection = asyncHandler(async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Write a simple SELECT SQL statement");
    const response = result.response;
    const text = response.text();
    
    return res.status(200).json({
      success: true,
      message: "Gemini API working properly",
      response: text
    });
  } catch (error) {
    console.error("Test Gemini API failed:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi test Gemini API",
      error: error.message
    });
  }
});

module.exports = {
  translateToSQL,
  testGeminiConnection
};