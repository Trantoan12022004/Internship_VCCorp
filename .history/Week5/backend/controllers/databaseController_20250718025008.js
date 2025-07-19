const dotenv = require("dotenv");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
dotenv.config();

// 1. Xem danh sách sản phẩm sắp hết hàng (tồn kho < 30)
const getLowStockProducts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({ UnitsInStock: { $lt: 30 } })
            .populate('CategoryID', 'CategoryName')
            .select('ProductName UnitsInStock')
            .sort({ UnitsInStock: 1 });

        res.status(200).json({
            success: true,
            count: lowStockProducts.length,
            data: lowStockProducts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách sản phẩm sắp hết hàng",
            error: error.message,
        });
    }
};

// 2. Tính tổng doanh thu theo từng danh mục sản phẩm
const getRevenueByCategory = async (req, res) => {
    try {
        const revenueByCategory = await OrderDetail.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'ProductID',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.CategoryID',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    CategoryName: { $first: '$category.CategoryName' },
                    TotalRevenue: {
                        $sum: {
                            $multiply: [
                                '$Quantity',
                                '$UnitPrice',
                                { $subtract: [1, '$Discount'] }
                            ]
                        }
                    }
                }
            },
            { $sort: { TotalRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: revenueByCategory.length,
            data: revenueByCategory,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tính doanh thu theo danh mục",
            error: error.message,
        });
    }
};

// 3. Xem top 5 khách hàng mua nhiều nhất
const getTopCustomers = async (req, res) => {
    try {
        const topCustomers = await Order.aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'CustomerID',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: '_id',
                    foreignField: 'OrderID',
                    as: 'orderDetails'
                }
            },
            { $unwind: '$orderDetails' },
            {
                $group: {
                    _id: '$customer._id',
                    CustomerName: { $first: '$customer.CustomerName' },
                    Phone: { $first: '$customer.Phone' },
                    TotalOrders: { $sum: 1 },
                    TotalSpent: {
                        $sum: {
                            $multiply: [
                                '$orderDetails.Quantity',
                                '$orderDetails.UnitPrice',
                                { $subtract: [1, '$orderDetails.Discount'] }
                            ]
                        }
                    }
                }
            },
            { $sort: { TotalOrders: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            count: topCustomers.length,
            data: topCustomers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy top khách hàng",
            error: error.message,
        });
    }
};

// 4. Xem doanh thu theo từng tháng trong năm 2025
const getMonthlyRevenue = async (req, res) => {
    try {
        const year = req.params.year || 2025;
        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    OrderDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${parseInt(year) + 1}-01-01`)
                    }
                }
            },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: '_id',
                    foreignField: 'OrderID',
                    as: 'orderDetails'
                }
            },
            { $unwind: '$orderDetails' },
            {
                $group: {
                    _id: {
                        month: { $month: '$OrderDate' },
                        year: { $year: '$OrderDate' }
                    },
                    MonthlyRevenue: {
                        $sum: {
                            $multiply: [
                                '$orderDetails.Quantity',
                                '$orderDetails.UnitPrice',
                                { $subtract: [1, '$orderDetails.Discount'] }
                            ]
                        }
                    }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: monthlyRevenue.length,
            data: monthlyRevenue,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy doanh thu theo tháng",
            error: error.message,
        });
    }
};

// 5. Tìm sản phẩm bán chạy nhất
const getBestSellingProducts = async (req, res) => {
    try {
        const bestSellingProducts = await OrderDetail.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'ProductID',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.CategoryID',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$product._id',
                    ProductName: { $first: '$product.ProductName' },
                    CategoryName: { $first: '$category.CategoryName' },
                    TotalSold: { $sum: '$Quantity' },
                    Revenue: {
                        $sum: {
                            $multiply: [
                                '$Quantity',
                                '$UnitPrice',
                                { $subtract: [1, '$Discount'] }
                            ]
                        }
                    }
                }
            },
            { $sort: { TotalSold: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            count: bestSellingProducts.length,
            data: bestSellingProducts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy sản phẩm bán chạy nhất",
            error: error.message,
        });
    }
};

// 6. Xem chi tiết đơn hàng gần đây nhất (7 ngày qua)
const getRecentOrderDetails = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await Order.aggregate([
            {
                $match: {
                    OrderDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'CustomerID',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: '_id',
                    foreignField: 'OrderID',
                    as: 'orderDetails'
                }
            },
            { $unwind: '$orderDetails' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderDetails.ProductID',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    OrderID: '$_id',
                    CustomerName: '$customer.CustomerName',
                    OrderDate: 1,
                    ProductName: '$product.ProductName',
                    Quantity: '$orderDetails.Quantity',
                    UnitPrice: '$orderDetails.UnitPrice',
                    Discount: '$orderDetails.Discount',
                    LineTotal: {
                        $multiply: [
                            '$orderDetails.Quantity',
                            '$orderDetails.UnitPrice',
                            { $subtract: [1, '$orderDetails.Discount'] }
                        ]
                    }
                }
            },
            { $sort: { OrderDate: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: recentOrders.length,
            data: recentOrders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy đơn hàng gần đây",
            error: error.message,
        });
    }
};

// 7. Tính giá trị tồn kho theo danh mục
const getInventoryValueByCategory = async (req, res) => {
    try {
        const inventoryValue = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'CategoryID',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    CategoryName: { $first: '$category.CategoryName' },
                    NumberOfProducts: { $sum: 1 },
                    TotalUnits: { $sum: '$UnitsInStock' },
                    InventoryValue: {
                        $sum: { $multiply: ['$UnitsInStock', '$UnitPrice'] }
                    }
                }
            },
            { $sort: { InventoryValue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: inventoryValue.length,
            data: inventoryValue,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tính giá trị tồn kho",
            error: error.message,
        });
    }
};

// 8. Tìm khách hàng chưa mua hàng trong 30 ngày qua
const getInactiveCustomers = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const inactiveCustomers = await Customer.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'CustomerID',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    LastOrderDate: { $max: '$orders.OrderDate' }
                }
            },
            {
                $match: {
                    $or: [
                        { LastOrderDate: { $lt: thirtyDaysAgo } },
                        { LastOrderDate: { $exists: false } }
                    ]
                }
            },
            {
                $project: {
                    CustomerName: 1,
                    Phone: 1,
                    City: 1,
                    LastOrderDate: 1
                }
            },
            { $sort: { LastOrderDate: 1 } }
        ]);

        res.status(200).json({
            success: true,
            count: inactiveCustomers.length,
            data: inactiveCustomers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tìm khách hàng không hoạt động",
            error: error.message,
        });
    }
};

// 9. Phân tích hiệu suất bán hàng theo thành phố
const getSalesPerformanceByCity = async (req, res) => {
    try {
        const salesByCity = await Customer.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'CustomerID',
                    as: 'orders'
                }
            },
            { $unwind: '$orders' },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: 'orders._id',
                    foreignField: 'OrderID',
                    as: 'orderDetails'
                }
            },
            { $unwind: '$orderDetails' },
            {
                $group: {
                    _id: '$City',
                    NumberOfCustomers: { $addToSet: '$_id' },
                    TotalOrders: { $sum: 1 },
                    CityRevenue: {
                        $sum: {
                            $multiply: [
                                '$orderDetails.Quantity',
                                '$orderDetails.UnitPrice',
                                { $subtract: [1, '$orderDetails.Discount'] }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    City: '$_id',
                    NumberOfCustomers: { $size: '$NumberOfCustomers' },
                    TotalOrders: 1,
                    CityRevenue: 1,
                    AvgOrderValue: { $divide: ['$CityRevenue', '$TotalOrders'] }
                }
            },
            { $sort: { CityRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            count: salesByCity.length,
            data: salesByCity,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi phân tích hiệu suất theo thành phố",
            error: error.message,
        });
    }
};

// 10. Báo cáo tổng quan kinh doanh hôm nay
const getTodayBusinessReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayReport = await Order.aggregate([
            {
                $match: {
                    OrderDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $lookup: {
                    from: 'orderdetails',
                    localField: '_id',
                    foreignField: 'OrderID',
                    as: 'orderDetails'
                }
            },
            { $unwind: '$orderDetails' },
            {
                $group: {
                    _id: null,
                    TodayOrders: { $addToSet: '$_id' },
                    TodayCustomers: { $addToSet: '$CustomerID' },
                    TotalItemsSold: { $sum: '$orderDetails.Quantity' },
                    TodayRevenue: {
                        $sum: {
                            $multiply: [
                                '$orderDetails.Quantity',
                                '$orderDetails.UnitPrice',
                                { $subtract: [1, '$orderDetails.Discount'] }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    TodayOrders: { $size: '$TodayOrders' },
                    TodayCustomers: { $size: '$TodayCustomers' },
                    TotalItemsSold: 1,
                    TodayRevenue: 1,
                    AvgOrderValue: { $divide: ['$TodayRevenue', { $size: '$TodayOrders' }] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: todayReport[0] || {
                TodayOrders: 0,
                TodayCustomers: 0,
                TotalItemsSold: 0,
                TodayRevenue: 0,
                AvgOrderValue: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy báo cáo kinh doanh hôm nay",
            error: error.message,
        });
    }
};

// Existing function
const getAllCustomers = async (req, res) => {
    try {
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