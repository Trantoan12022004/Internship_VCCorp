const express = require("express");
const router = express.Router();
const {  } = require("../controllers/nlToSqlController");


router.get("/get", testGeminiConnection);


module.exports = router;
