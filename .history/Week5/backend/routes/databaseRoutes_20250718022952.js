const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/databaseController");

router.get("/get-all-customers", getAllCustomers);
// Route để kiểm tra kết nối với Gemini API
router.get("/test", testGeminiConnection);

module.exports = router;
