const express = require("express");
const router = express.Router();
const { 
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
} = require("../controllers/databaseController");

// 1. Lấy danh sách tất cả khách hàng
router.get("/customers", getAllCustomers);

// 2. Xem danh sách sản phẩm sắp hết hàng (tồn kho < 30)
router.get("/products/low-stock", getLowStockProducts);

// 3. Tính tổng doanh thu theo từng danh mục sản phẩm
router.get("/revenue/by-category", getRevenueByCategory);

// 4. Xem top 5 khách hàng mua nhiều nhất
router.get("/customers/top", getTopCustomers);

// 5. Xem doanh thu theo từng tháng trong năm (mặc định 2025)
router.get("/revenue/monthly", getMonthlyRevenue);
router.get("/revenue/monthly/:year", getMonthlyRevenue);

// 6. Tìm sản phẩm bán chạy nhất
router.get("/products/best-selling", getBestSellingProducts);

// 7. Xem chi tiết đơn hàng gần đây nhất (7 ngày qua)
router.get("/orders/recent", getRecentOrderDetails);

// 8. Tính giá trị tồn kho theo danh mục
router.get("/inventory/value-by-category", getInventoryValueByCategory);

// 9. Tìm khách hàng chưa mua hàng trong 30 ngày qua
router.get("/customers/inactive", getInactiveCustomers);

// 10. Phân tích hiệu suất bán hàng theo thành phố
router.get("/sales/performance-by-city", getSalesPerformanceByCity);

// 11. Báo cáo tổng quan kinh doanh hôm nay
router.get("/reports/today", getTodayBusinessReport);

module.exports = router;