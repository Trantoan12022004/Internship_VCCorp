const express = require("express");
const router = express.Router();
const { getTasks, testConnection } = require("../controllers/taskController");

router.get("/get", getTasks);
router.get("/test", getTasks);


module.exports = router;
