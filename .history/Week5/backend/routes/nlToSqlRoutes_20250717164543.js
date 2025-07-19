const express = require("express");
const router = express.Router();
const { translateToSQL } = require("../controllers/nlToSqlController");

// Route để chuyển đổi ngôn ngữ tự nhiên sang SQL
router.post("/translate", translateToSQL);
// Route để kiểm tra kết nối với Gemini API
router.get("/check-gemini-api", checkGeminiAPI);

module.exports = router;
