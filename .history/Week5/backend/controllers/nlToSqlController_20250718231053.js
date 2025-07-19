const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const axios = require("axios");
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

// Danh sách các chức năng có sẵn
const AVAILABLE_FUNCTIONS = [
    {
        endpoint: "/api/database/customers",
        method: "GET",
        description: "Lấy danh sách khách hàng",
        keywords: ["khách hàng", "customer", "danh sách khách hàng", "tất cả khách hàng", "khách"]
    },
    {
        endpoint: "/api/database/products/low-stock",
        method: "GET", 
        description: "Sản phẩm sắp hết hàng",
        keywords: ["sắp hết hàng", "tồn kho thấp", "low stock", "hết hàng", "tồn kho", "sản phẩm ít"]
    },
    {
        endpoint: "/api/database/revenue/by-category",
        method: "GET",
        description: "Doanh thu theo danh mục",
        keywords: ["doanh thu theo danh mục", "revenue category", "doanh thu danh mục", "thu nhập danh mục"]
    },
    {
        endpoint: "/api/database/customers/top",
        method: "GET",
        description: "Top 5 khách hàng",
        keywords: ["top khách hàng", "khách hàng VIP", "khách hàng mua nhiều", "top 5", "khách hàng tốt nhất"]
    },
    {
        endpoint: "/api/database/revenue/monthly",
        method: "GET",
        description: "Doanh thu theo tháng (năm 2025)",
        keywords: ["doanh thu tháng", "monthly revenue", "doanh thu theo tháng", "thu nhập tháng", "2025"]
    },
    {
        endpoint: "/api/database/revenue/monthly/2024",
        method: "GET",
        description: "Doanh thu theo tháng năm 2024",
        keywords: ["doanh thu tháng 2024", "monthly revenue 2024", "doanh thu 2024", "2024"]
    },
    {
        endpoint: "/api/database/products/best-selling",
        method: "GET",
        description: "Sản phẩm bán chạy nhất",
        keywords: ["sản phẩm bán chạy", "best selling", "bán chạy nhất", "sản phẩm hot", "sản phẩm phổ biến"]
    },
    {
        endpoint: "/api/database/orders/recent",
        method: "GET",
        description: "Đơn hàng gần đây (7 ngày)",
        keywords: ["đơn hàng gần đây", "recent orders", "đơn hàng mới", "7 ngày", "đơn hàng tuần"]
    },
    {
        endpoint: "/api/database/inventory/value-by-category",
        method: "GET",
        description: "Giá trị tồn kho theo danh mục",
        keywords: ["giá trị tồn kho", "inventory value", "tồn kho danh mục", "giá trị hàng hóa"]
    },
    {
        endpoint: "/api/database/customers/inactive",
        method: "GET",
        description: "Khách hàng không hoạt động (30 ngày)",
        keywords: ["khách hàng không hoạt động", "inactive customers", "khách hàng cũ", "30 ngày", "khách hàng im lặng"]
    },
    {
        endpoint: "/api/database/sales/performance-by-city",
        method: "GET",
        description: "Hiệu suất bán hàng theo thành phố",
        keywords: ["hiệu suất theo thành phố", "sales by city", "bán hàng thành phố", "performance city"]
    },
    {
        endpoint: "/api/database/reports/today",
        method: "GET",
        description: "Báo cáo kinh doanh hôm nay",
        keywords: ["báo cáo hôm nay", "today report", "kinh doanh hôm nay", "hôm nay", "báo cáo ngày"]
    }
];

// @desc    Test kết nối Gemini API
// @route   GET /api/nlsql/test
// @access  Public
const testGeminiConnection = asyncHandler(async (req, res) => {
    try {
        console.log("🔄 Testing Gemini API connection...");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: "tạo một câu chuyện dài khoảng 300 chữ"
        });

        console.log("✅ Response received from Gemini");

        return res.status(200).json({
            success: true,
            message: "🎉 Gemini API hoạt động tốt!",
            response: response.text || response,
            model: "gemini-2.5-pro",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Gemini API test failed:", error);

        return res.status(500).json({
            success: false,
            message: "💥 Gemini API không hoạt động",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// @desc    Phân tích yêu cầu và gọi API tương ứng
// @route   POST /api/nlsql/analyze
// @access  Public
const analyzeAndExecute = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;
        console.log("📝 Received request:", text);

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "❌ Vui lòng nhập yêu cầu"
            });
        }

        // Tạo prompt để AI phân tích yêu cầu
        const functionsText = AVAILABLE_FUNCTIONS.map((func, index) => 
            `${index + 1}. ${func.description} - ${func.endpoint}`
        ).join('\n');

        const prompt = `
Bạn là một AI assistant chuyên phân tích yêu cầu của người dùng và chọn API phù hợp.

Danh sách các API có sẵn:
${functionsText}

Yêu cầu của người dùng: "${text}"

Hãy phân tích yêu cầu và trả về chỉ SỐ THỨ TỰ (1-12) của API phù hợp nhất. 
Chỉ trả về một số duy nhất, không giải thích gì thêm.

Số thứ tự:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt
        });

        const selectedNumber = parseInt((response.text || response).trim());
        console.log("🤖 AI selected function number:", selectedNumber);

        if (!selectedNumber || selectedNumber < 1 || selectedNumber > AVAILABLE_FUNCTIONS.length) {
            return res.status(400).json({
                success: false,
                message: "❌ Không thể xác định chức năng phù hợp với yêu cầu của bạn",
                originalText: text
            });
        }

        const selectedFunction = AVAILABLE_FUNCTIONS[selectedNumber - 1];
        console.log("🎯 Selected function:", selectedFunction);

        // Gọi API tương ứng
        const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
        const apiResponse = await axios.get(`${baseURL}${selectedFunction.endpoint}`);

        console.log("✅ API call successful");

        return res.status(200).json({
            success: true,
            message: `🎉 Đã thực hiện: ${selectedFunction.description}`,
            originalText: text,
            selectedFunction: {
                description: selectedFunction.description,
                endpoint: selectedFunction.endpoint
            },
            data: apiResponse.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Error in analyzeAndExecute:", error);
        
        if (error.response) {
            // Lỗi từ API call
            return res.status(error.response.status).json({
                success: false,
                message: "💥 Lỗi khi gọi API",
                error: error.response.data,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(500).json({
            success: false,
            message: "💥 Lỗi khi xử lý yêu cầu",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// @desc    Chuyển đổi ngôn ngữ tự nhiên sang SQL (giữ lại function cũ)
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
const chatWithGemini = asyncHandler(async (req, res) => {
    try {
        const { question } = req.body;
        if (!question || typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "❌ Vui lòng nhập câu hỏi hợp lệ!",
                timestamp: new Date().toISOString()
            });
        }

        console.log("💬 User question:", question);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: question
        });

        console.log("✅ AI response:", response.text || response);

        return res.status(200).json({
            success: true,
            question,
            answer: response.text || response,
            model: "gemini-2.5-pro",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Gemini chat failed:", error);

        return res.status(500).json({
            success: false,
            message: "💥 Đã xảy ra lỗi khi hỏi đáp với AI",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
module.exports = {
    testGeminiConnection,
    analyzeAndExecute,
    translateToSQL,
    
};