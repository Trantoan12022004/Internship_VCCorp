const express = require("express");
const router = express.Router();
const { translateToSQL, testGeminiConnection, analyzeAndExecute, chatWithGemini } = require("../controllers/nlToSqlController");


router.get("/get", testGeminiConnection);


module.exports = router;
