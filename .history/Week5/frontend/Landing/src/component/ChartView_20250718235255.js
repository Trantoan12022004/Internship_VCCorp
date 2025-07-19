import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ChartView({ chartData, selectedFunction }) {
    if (!chartData || !Array.isArray(chartData)) return null;

    // Xử lý dữ liệu cho từng loại API
    let labels = [];
    let values = [];
    let label = "";

    if (selectedFunction?.endpoint === "/api/database/revenue/monthly") {
        labels = chartData.map(item => `Tháng ${item._id.month}/${item._id.year}`);
        values = chartData.map(item => item.MonthlyRevenue);
        label = "Doanh thu theo tháng";
    } else if (selectedFunction?.endpoint === "/api/database/revenue/by-category") {
        labels = chartData.map(item => item.CategoryName);
        values = chartData.map(item => item.TotalRevenue);
        label = "Doanh thu theo danh mục";
    } else {
        // fallback cho các loại dữ liệu khác
        labels = chartData.map((item, idx) => `Mục ${idx + 1}`);
        values = chartData.map(item => item.value || 0);
        label = "Dữ liệu";
    }

    const data = {
        labels,
        datasets: [
            {
                label,
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
        ],
    };

    return (
        <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginTop: 24 }}>
            <h5 className="mb-3">{label}</h5>
            <Bar data={data} />
        </div>
    );
}