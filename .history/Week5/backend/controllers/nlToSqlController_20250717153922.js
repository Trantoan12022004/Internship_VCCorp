const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

// Sử dụng API mới của Google
const { GoogleGenAI } = require("@google/genai");

// Kiểm tra API key trước khi khởi tạo
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY không được tìm thấy trong biến môi trường!");
    throw new Error("GEMINI_API_KEY is not defined");
}

// Hiển thị vài ký tự đầu của API key để kiểm tra (bảo mật)
console.log("GEMINI_API_KEY found:", process.env.GEMINI_API_KEY.substring(0, 4) + "..." + process.env.GEMINI_API_KEY.slice(-4));

// Khởi tạo client theo cách mới
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
console.log("Google GenAI initialized");

// Hàm test API
const testGeminiConnection = asyncHandler(async (req, res) => {
    try {
        console.log("Testing Gemini API connection...");
        const response = await ai.models.generateContent({
            model: "gemini-pro",
            contents: "Hello, can you respond with 'API is working'?",
        });

        console.log("Response received:", response);
        
        if (!response || !response.text) {
            throw new Error("Invalid response format from Gemini API");
        }

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
            error: error.message || "Unknown error"
        });
    }
});

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
        // console.error("Error in translateToSQL:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xử lý yêu cầu",
            error: error.message,
        });
    }
});

module.exports = {
    translateToSQL,
    testGeminiConnection
};