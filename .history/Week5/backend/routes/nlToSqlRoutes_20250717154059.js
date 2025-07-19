const express = require("express");
const router = express.Router();
const { translateToSQL } = require("../controllers/nlToSqlController");

// Route để chuyển đổi ngôn ngữ tự nhiên sang SQL
router.post("/translate", taonoi);

module.exports = router;
