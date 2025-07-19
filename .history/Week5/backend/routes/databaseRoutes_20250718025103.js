const express = require("express");
const router = express.Router();
const { getLowStockProducts } = require("../controllers/databaseController");

router.get("/getLowStockProducts", getLowStockProducts);

module.exports = router;
