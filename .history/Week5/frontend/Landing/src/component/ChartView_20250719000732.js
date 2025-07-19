import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function ChartView({ chartData, selectedFunction }) {
    if (!chartData || !Array.isArray(chartData)) return null;

    let labels = [];
    let values = [];
    let label = "";
    let chartType = "bar";

    // Doanh thu theo tháng
    if (selectedFunction?.endpoint === "/api/database/revenue/monthly") {
        labels = chartData.map(item => `Tháng ${item._id.month}/${item._id.year}`);
        values = chartData.map(item => item.MonthlyRevenue);
        label = "Doanh thu theo tháng";
        chartType = "bar";
    }
    // Doanh thu theo danh mục
    else if (selectedFunction?.endpoint === "/api/database/revenue/by-category") {
        labels = chartData.map(item => item.CategoryName);
        values = chartData.map(item => item.TotalRevenue);
        label = "Doanh thu theo danh mục";
        chartType = "bar";
    }
    // Sản phẩm sắp hết hàng
    else if (selectedFunction?.endpoint === "/api/database/products/low-stock") {
        labels = chartData.map(item => item.ProductName);
        values = chartData.map(item => item.UnitsInStock);
        label = "Số lượng tồn kho sản phẩm sắp hết";
        chartType = "bar";
    }
    // Top 5 khách hàng mua nhiều nhất
    else if (selectedFunction?.endpoint === "/api/database/customers/top") {
        labels = chartData.map(item => item.CustomerName);
        values = chartData.map(item => item.TotalSpent);
        label = "Top 5 khách hàng chi tiêu nhiều nhất";
        chartType = "bar";
    }
    // Sản phẩm bán chạy nhất
    else if (selectedFunction?.endpoint === "/api/database/products/best-selling") {
        labels = chartData.map(item => item.ProductName);
        values = chartData.map(item => item.TotalSold);
        label = "Top sản phẩm bán chạy nhất";
        chartType = "bar";
    }
    // Giá trị tồn kho theo danh mục
    else if (selectedFunction?.endpoint === "/api/database/inventory/value-by-category") {
        labels = chartData.map(item => item.CategoryName);
        values = chartData.map(item => item.InventoryValue);
        label = "Giá trị tồn kho theo danh mục";
        chartType = "bar";
    }
    // Hiệu suất bán hàng theo thành phố
    else if (selectedFunction?.endpoint === "/api/database/sales/performance-by-city") {
        labels = chartData.map(item => item.City);
        values = chartData.map(item => item.CityRevenue);
        label = "Doanh thu theo thành phố";
        chartType = "bar";
    }
    // Báo cáo kinh doanh hôm nay (dạng object, không phải array)
    else if (selectedFunction?.endpoint === "/api/database/reports/today" && chartData && !Array.isArray(chartData)) {
        // Chuyển object thành dữ liệu biểu đồ tròn
        labels = [
            "Đơn hàng hôm nay",
            "Khách hàng hôm nay",
            "Sản phẩm bán ra",
            "Doanh thu hôm nay",
            "Giá trị TB đơn hàng"
        ];
        values = [
            chartData.TodayOrders,
            chartData.TodayCustomers,
            chartData.TotalItemsSold,
            chartData.TodayRevenue,
            chartData.AvgOrderValue
        ];
        label = "Báo cáo kinh doanh hôm nay";
        chartType = "pie";
    }
    // fallback cho các loại dữ liệu khác
    else {
        labels = chartData.map((item, idx) => `Mục ${idx + 1}`);
        values = chartData.map(item => item.value || 0);
        label = "Dữ liệu";
        chartType = "bar";
    }

    const data = {
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor: chartType === "pie"
                    ? [
                        "#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
                    ]
                    : "rgba(54, 162, 235, 0.6)",
            },
        ],
    };

    return (
        <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginTop: 24 }}>
            <h5 className="mb-3">{label}</h5>
            {chartType === "pie" ? (
                <Pie data={data} />
            ) : (
                <Bar data={data} />
            )}
        </div>
    );
}
