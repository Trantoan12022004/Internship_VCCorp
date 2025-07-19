const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/databaseController");

router.get("/getLowStockProducts", getAllCustomers);

module.exports = router;
