const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/nlToSqlController");

// Route để chuyển đổi ngôn ngữ tự nhiên sang SQL
router.post("/get-all-customers", translateToSQL);
// Route để kiểm tra kết nối với Gemini API
router.get("/test", testGeminiConnection);

module.exports = router;
