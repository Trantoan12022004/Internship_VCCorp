const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("Google GenAI initialized with API key",);

const translateToSQL = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;
        console.log("Received text for translation:", text);

        if (!text) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
        }

        // Tạo prompt
        const prompt = `
            Chuyển đổi câu hỏi sau đây thành câu lệnh SQL:
            "${text}"
            
            Chỉ trả về câu lệnh SQL hoàn chỉnh, không kèm theo giải thích.
        `;

        // Sử dụng API mới để sinh nội dung
        const response = await ai.models.generateContent({
            model: "gemini-pro",  // Hoặc "gemini-2.0-flash" nếu đã có quyền truy cập
            contents: prompt,
        });

        const sqlQuery = response.text;
        console.log("Generated SQL:", sqlQuery);

        return res.status(200).json({
            success: true,
            query: sqlQuery,
            originalText: text,
        });
    } catch (error) {
        console.error("Error in translateToSQL:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xử lý yêu cầu",
            error: error.message,
        });
    }
});

// Hàm test API
const testGeminiConnection = asyncHandler(async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-pro", // Hoặc "gemini-2.0-flash" nếu đã có quyền truy cập
            contents: "Generate a simple SELECT SQL query",
        });

        return res.status(200).json({
            success: true,
            message: "Google GenAI API hoạt động bình thường",
            response: response.text
        });
    } catch (error) {
        console.error("Test Google GenAI API failed:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi test Google GenAI API",
            error: error.message
        });
    }
});

module.exports = {
    translateToSQL,
    testGeminiConnection
};