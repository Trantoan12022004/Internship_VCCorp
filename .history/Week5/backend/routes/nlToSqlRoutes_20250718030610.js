const express = require("express");
const router = express.Router();
const { translateToSQL, testGeminiConnection } = require("../controllers/nlToSqlController");

// Route để chuyển đổi ngôn ngữ tự nhiên sang SQL
router.post("/translate", translateToSQL);
// Route để kiểm tra kết nối với Gemini API
router.get("/test", testGeminiConnection);
router.get("/test", testGeminiConnection);



module.exports = router;
