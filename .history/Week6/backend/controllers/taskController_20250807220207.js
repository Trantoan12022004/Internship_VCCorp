const dotenv = require("dotenv");
const Task = require("../models/Task");
dotenv.config();

const getTasks = async (req, res) => {
    try {
        // Lấy các query parameters để filter (nếu có)
        const { is_completed, date, sort = "date", order = "asc", limit, page = 1 } = req.query;

        // Tạo filter object
        let filter = {};

        // Filter theo trạng thái hoàn thành
        if (is_completed !== undefined) {
            filter.is_completed = is_completed === "true";
        }

        // Filter theo ngày
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        }

        // Tạo sort object
        const sortOrder = order === "desc" ? -1 : 1;
        const sortObj = {};
        sortObj[sort] = sortOrder;

        // Tính toán pagination
        const limitNum = limit ? parseInt(limit) : 0;
        const skip = limitNum > 0 ? (parseInt(page) - 1) * limitNum : 0;

        // Query database
        let query = Task.find(filter).sort(sortObj);

        if (limitNum > 0) {
            query = query.skip(skip).limit(limitNum);
        }

        const tasks = await query;

        // Đếm tổng số documents (cho pagination)
        const totalTasks = await Task.countDocuments(filter);

        console.log(`Tasks fetched successfully: ${tasks.length} tasks found`);

        // Trả về kết quả với metadata
        res.status(200).json({
            success: true,
            count: tasks.length,
            total: totalTasks,
            page: parseInt(page),
            limit: limitNum || totalTasks,
            data: tasks,
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách task",
            error: error.message,
        });
    }
};

module.exports = {
    getTasks,
};
