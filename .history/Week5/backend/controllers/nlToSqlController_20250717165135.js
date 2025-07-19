const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Kiểm tra API key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY không tồn tại trong file .env!");
    process.exit(1);
}

console.log("✅ API key found:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

// Khởi tạo client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("🚀 Google GenAI client initialized");

// @desc    Test kết nối Gemini API
// @route   GET /api/nlsql/test
// @access  Public
const testGeminiConnection = asyncHandler(async (req, res) => {
    try {
        console.log("🔄 Testing Gemini API connection...");
        
        // Test với model gemini-2.5-pro (từ kết quả Python test)
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: "tạo một câu"
        });

        console.log("✅ Response received from Gemini");
        console.log("📄 Full response:", response);

        return res.status(200).json({
            success: true,
            message: "🎉 Gemini API hoạt động tốt!",
            response: response.text || response,
            model: "gemini-2.5-pro",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Gemini API test failed:");
        console.error("Error message:", error.message);
        console.error("Error details:", error);

        return res.status(500).json({
            success: false,
            message: "💥 Gemini API không hoạt động",
            error: error.message,
            errorDetails: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
});

// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;
        console.log("📝 Received text for translation:", text);

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "❌ Vui lòng nhập câu hỏi"
            });
        }

        // Tạo prompt cho việc chuyển đổi sang SQL
        const prompt = `
Bạn là một chuyên gia SQL. Hãy chuyển đổi câu hỏi tiếng Việt sau thành câu lệnh SQL chuẩn.

Câu hỏi: "${text}"

Quy tắc:
1. Chỉ trả về câu lệnh SQL, không giải thích
2. Sử dụng cú pháp SQL chuẩn
3. Giả sử các bảng có tên hợp lý (users, products, orders, etc.)
4. Sử dụng tiếng Anh cho tên cột và bảng

SQL:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt
        });

        const sqlQuery = response.text || response;
        console.log("✅ Generated SQL:", sqlQuery);

        return res.status(200).json({
            success: true,
            originalText: text,
            sqlQuery: sqlQuery,
            model: "gemini-2.5-pro",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Error in translateToSQL:", error);
        return res.status(500).json({
            success: false,
            message: "💥 Lỗi khi xử lý yêu cầu",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = {
    testGeminiConnection,
    translateToSQL
};