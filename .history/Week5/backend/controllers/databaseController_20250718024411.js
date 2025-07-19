// const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
dotenv.config();

const getAllCustomers = async (req, res) => {
    try {
        // Kiểm tra trạng thái kết nối
        const mongoose = require('mongoose');
        console.log("Database connection state:", mongoose.connection.readyState); // 1 = connected
        console.log("Database name:", mongoose.connection.db?.databaseName);
        console.log("Collection name:", Customer.collection.name);

        const totalCount = await Customer.countDocuments();
        console.log("Tổng số documents trong collection:", totalCount);
        
        // Kiểm tra tất cả collections trong database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Tất cả collections:", collections.map(col => col.name));
        
        const customers = await Customer.find();
        console.log("Danh sách khách hàng:", customers);
        
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
        });
    } catch (error) {
        console.error("Error details:", error);
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
