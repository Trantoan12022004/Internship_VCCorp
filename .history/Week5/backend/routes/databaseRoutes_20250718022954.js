const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/databaseController");

router.get("/get-all-customers", getAllCustomers);

module.exports = router;
