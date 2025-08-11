const dotenv = require("dotenv");
const Task = require("../models/Task");
const mongoose = require("mongoose");
dotenv.config();

const getTasks = async (req, res) => {
    try {
        console.log("=== GET TASKS REQUEST ===");
        console.log("Database connection state:", mongoose.connection.readyState);
        console.log("Collection name:", Task.collection.name);
        
        // Lấy các query parameters để filter (nếu có)
        const { 
            is_completed, 
            date, 
            sort = 'date', 
            order = 'asc',
            limit,
            page = 1
        } = req.query;

        // Tạo filter object
        let filter = {};
        
        // Filter theo trạng thái hoàn thành
        if (is_completed !== undefined) {
            filter.is_completed = is_completed === 'true';
        }

        // Filter theo ngày
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            filter.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        console.log("Filter applied:", filter);

        // Tạo sort object
        const sortOrder = order === 'desc' ? -1 : 1;
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
        console.log("Total tasks in database:", totalTasks);
        
        if (tasks.length > 0) {
            console.log("Sample task:", JSON.stringify(tasks[0], null, 2));
        }
        
        // Trả về kết quả với metadata
        res.status(200).json({
            success: true,
            count: tasks.length,
            total: totalTasks,
            page: parseInt(page),
            limit: limitNum || totalTasks,
            data: tasks
        });

    } catch (error) {
        console.error("=== ERROR GETTING TASKS ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi lấy danh sách task", 
            error: error.message 
        });
    }
}

// Thêm function test kết nối
const testConnection = async (req, res) => {
    try {
        console.log("=== TESTING DATABASE CONNECTION ===");
        
        // Kiểm tra connection state
        const connectionStates = {
            0: 'disconnected',
            1: 'connected', 
            2: 'connecting',
            3: 'disconnecting'
        };
        
        const state = mongoose.connection.readyState;
        console.log("Connection state:", connectionStates[state]);
        console.log("Database name:", mongoose.connection.db?.databaseName);
        console.log("Collection name:", Task.collection.name);
        
        // Test basic queries
        const count = await Task.countDocuments();
        const firstDoc = await Task.findOne();
        const allTasks = await Task.find().limit(5);
        
        console.log("Total documents:", count);
        console.log("First document:", firstDoc);
        
        res.json({
            success: true,
            connectionState: connectionStates[state],
            databaseName: mongoose.connection.db?.databaseName,
            collectionName: Task.collection.name,
            totalDocuments: count,
            firstDocument: firstDoc,
            sampleTasks: allTasks
        });
        
    } catch (error) {
        console.error("=== TEST CONNECTION ERROR ===");
        console.error(error);
        
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = {
    getTasks,
    testConnection
};