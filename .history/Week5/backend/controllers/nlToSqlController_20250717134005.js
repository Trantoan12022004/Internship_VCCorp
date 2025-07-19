const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('express-async-handler');

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error('Vui lòng nhập câu truy vấn');
  }

  try {
    // Khởi tạo model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Tạo prompt để gửi đến Gemini
    const prompt = `Convert the following natural language query to SQL query. Only return the SQL query without any explanation or additional text:
    "${query}"`;
    
    // Gọi API Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sqlQuery = response.text();
    
    res.status(200).json({
      success: true,
      naturalLanguage: query,
      sqlQuery: sqlQuery.trim()
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Lỗi khi chuyển đổi câu truy vấn: ${error.message}`);
  }
});

module.exports = {
  translateToSQL
};
