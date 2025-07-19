const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative");const translateToSQL = asyncHandler(async (req, res) => {
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

module.exports = {
    translateToSQL,
};
