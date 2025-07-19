// const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
dotenv.config();

const getAllCustomers = async (req, res) => {
    try {

        console.log("Collection name:", Customer.collection.name);

        
        const customers = await Customer.find();
        console.log("Danh sách khách hàng:", customers);
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách khách hàng",
            error: error.message,
        });
    }
};

module.exports = {
    getAllCustomers,
};
