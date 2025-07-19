const { GoogleGenerativeAI } = require("@google/generative-ai");
const asyncHandler = require("express-async-handler");

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("Gemini API initialized with provided API key.", genAI);
// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL
// @route   POST /api/nlsql/translate
// @access  Public
const translateToSQL = asyncHandler(async (req, res) => {
    try {
        // Lấy input text từ request
        const { text } = req.body;
        console.log("Received text for translation:", text);
        if (!text) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
        }
        
        // Tạo prompt cho model
        const prompt = `Chuyển đổi câu hỏi sau đây thành câu lệnh SQL: "${text}"`;
        
        // Khởi tạo model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Model initialized:", model);
        // Gọi API để tạo SQL
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const sqlQuery = response.text();
        
        // console.log("Generated SQL:", sqlQuery);
        
        return res.status(200).json({
            success: true,
            query: sqlQuery,
            originalText: text
        });
    } catch (error) {
        // console.error("Error in translateToSQL:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xử lý yêu cầu",
            error: error.message
        });
    }
});

module.exports = {
    translateToSQL,
};
