const express = require("express");
const router = express.Router();


router.get("/get", testGeminiConnection);


module.exports = router;
