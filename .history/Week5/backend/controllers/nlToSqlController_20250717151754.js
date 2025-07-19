const { GoogleGenerativeAI } = require("@google/ge");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
// Khởi tạo Gemini API với API key
console.log("check API", process.env.GEMINI_API_KEY);
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

        // Tạo prompt cho model - Sửa prompt cụ thể hơn
        const prompt = `"${text}"
        `;
        console.log("Prompt for Gemini:", prompt);
        try {
            // Khởi tạo model
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent(prompt);
            console.log(result.response.text());
        } catch (apiError) {
            console.error("Gemini API Error:", apiError);
            return res.status(500).json({
                success: false,
                message: "Lỗi khi gọi Gemini API",
                error: apiError.message,
            });
        }
    } catch (error) {
        console.error("Error in translateToSQL:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi khi xử lý yêu cầu",
            error: error.message,
        });
    }
});

module.exports = {
    translateToSQL,
};
