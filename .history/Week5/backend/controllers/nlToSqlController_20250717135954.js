const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("express-async-handler");

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API initialized with provided API key.", genAI);
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {
});
// Hàm kiểm tra kết nối
async function testGeminiConnection() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Gemini API test response:", text);
    return true;
  } catch (error) {
    console.error("Gemini API connection test failed:", error);
    return false;
  }
}

// Gọi hàm test trong một đoạn code riêng biệt hoặc khi khởi động server
testGeminiConnection().then(success => {
  console.log("Gemini API working:", success);
});
module.exports = {
    translateToSQL,
};
