const dotenv = require("dotenv");
const Task = require("../models/Task");
dotenv.config();



module.exports = {
    getAllCustomers,
    getLowStockProducts,
    getRevenueByCategory,
    getTopCustomers,
    getMonthlyRevenue,
    getBestSellingProducts,
    getRecentOrderDetails,
    getInventoryValueByCategory,
    getInactiveCustomers,
    getSalesPerformanceByCity,
    getTodayBusinessReport,
};