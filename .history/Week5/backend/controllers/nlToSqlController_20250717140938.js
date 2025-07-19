const { GoogleGenerativeAI } = require("@google/generative-ai");
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
    // try {
    //     // Lấy input text từ request
    //     const { text } = req.body;
    //     console.log("Received text for translation:", text);
    //     if (!text) {
    //         return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
    //     }

    //     // Tạo prompt cho model - Sửa prompt cụ thể hơn
    //     const prompt = `
    //     Hãy chuyển đổi câu hỏi sau đây thành câu lệnh SQL chuẩn.
    //     Chỉ trả về câu lệnh SQL, không kèm theo giải thích.
    //     Câu hỏi: "${text}"
    //     `;

    //     try {
    //         // Khởi tạo model
    //         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    //         console.log("Model initialized successfully");

    //         // Gọi API để tạo SQL - Thêm các tùy chọn
    //         const result = await model.generateContent({
    //             contents: [{ role: "user", parts: [{ text: prompt }] }],
    //             generationConfig: {
    //                 temperature: 0.2,
    //                 maxOutputTokens: 200,
    //             },
    //         });

    //         console.log("Gemini response received");
    //         const response = result.response;
    //         const sqlQuery = response.text();
    //         console.log("Generated SQL:", sqlQuery);

    //         return res.status(200).json({
    //             success: true,
    //             query: sqlQuery,
    //             originalText: text,
    //         });
    //     } catch (apiError) {
    //         console.error("Gemini API Error:", apiError);
    //         return res.status(500).json({
    //             success: false,
    //             message: "Lỗi khi gọi Gemini API",
    //             error: apiError.message,
    //         });
    //     }
    // } catch (error) {
    //     console.error("Error in translateToSQL:", error);
    //     return res.status(500).json({
    //         success: false,
    //         message: "Lỗi khi xử lý yêu cầu",
    //         error: error.message,
    //     });
    // }
});

module.exports = {
    translateToSQL,
};
