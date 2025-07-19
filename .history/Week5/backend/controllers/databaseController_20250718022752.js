// const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
dotenv.config();

const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
        });
    } catch (error) {}
};

module.exports = {};
