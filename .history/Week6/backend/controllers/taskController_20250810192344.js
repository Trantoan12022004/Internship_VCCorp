const dotenv = require("dotenv");
const Task = require("../models/Task");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
dotenv.config();

// @desc    Lấy tất cả tasks
// @route   GET /api/task/get
// @access  Public
const getTasks = async (req, res) => {
    try {
        console.log("=== GET TASKS REQUEST ===");
        console.log("Database connection state:", mongoose.connection.readyState);
        console.log("Collection name:", Task.collection.name);

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

        console.log("Filter applied:", filter);

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
            data: tasks,
        });
    } catch (error) {
        console.error("=== ERROR GETTING TASKS ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy danh sách task",
            error: error.message,
        });
    }
};

// @desc    Lấy task theo ID
// @route   GET /api/task/:id
// @access  Public
const getTaskById = async (req, res) => {
    try {
        console.log("=== GET TASK BY ID ===");
        console.log("Task ID:", req.params.id);

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID task không hợp lệ",
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task",
            });
        }

        console.log("Task found:", task.title);

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error("=== ERROR GETTING TASK BY ID ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy task",
            error: error.message,
        });
    }
};

// @desc    Tạo task mới
// @route   POST /api/task/create
// @access  Public
const createTask = async (req, res) => {
    try {
        console.log("=== CREATE TASK REQUEST ===");
        console.log("Request body:", req.body);

        const { title, description, date, time, is_completed } = req.body;

        // Validate required fields
        if (!title || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin: title, date, time",
            });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                success: false,
                message: "Định dạng thời gian không hợp lệ. Vui lòng sử dụng HH:MM",
            });
        }

        // Validate date
        const taskDate = new Date(date);
        if (isNaN(taskDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Định dạng ngày không hợp lệ",
            });
        }

        // Tạo task mới
        const newTask = await Task.create({
            title,
            description: description || "",
            date: taskDate,
            time,
            is_completed: is_completed || false,
        });

        console.log("Task created successfully:", newTask.title);

        res.status(201).json({
            success: true,
            message: "Task được tạo thành công",
            data: newTask,
        });
    } catch (error) {
        console.error("=== ERROR CREATING TASK ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo task",
            error: error.message,
        });
    }
};

// @desc    Cập nhật task
// @route   PUT /api/task/:id
// @access  Public
const updateTask = async (req, res) => {
    try {
        console.log("=== UPDATE TASK REQUEST ===");
        console.log("Task ID:", req.params.id);
        console.log("Request body:", req.body);

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID task không hợp lệ",
            });
        }

        const { title, description, date, time, is_completed } = req.body;
        console.log("is_completed:", is_completed);
        // Validate time format nếu có update time
        if (time) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(time)) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng thời gian không hợp lệ. Vui lòng sử dụng HH:MM",
                });
            }
        }

        // Validate date nếu có update date
        let taskDate;
        if (date) {
            taskDate = new Date(date);
            if (isNaN(taskDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Định dạng ngày không hợp lệ",
                });
            }
        }

        // Tạo object update (chỉ update những field được gửi lên)
        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (date !== undefined) updateFields.date = taskDate;
        if (time !== undefined) updateFields.time = time;
        if (is_completed !== undefined) updateFields.is_completed = is_completed;

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateFields, {
            new: true, // Trả về document sau khi update
            runValidators: true, // Chạy validation
        });

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task",
            });
        }

        console.log("Task updated successfully:", updatedTask.title);

        res.status(200).json({
            success: true,
            message: "Task được cập nhật thành công",
            data: updatedTask,
        });
    } catch (error) {
        console.error("=== ERROR UPDATING TASK ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật task",
            error: error.message,
        });
    }
};

// @desc    Xóa task
// @route   DELETE /api/task/:id
// @access  Public
const deleteTask = async (req, res) => {
    try {
        console.log("=== DELETE TASK REQUEST ===");
        console.log("Task ID:", req.params.id);

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID task không hợp lệ",
            });
        }

        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task",
            });
        }

        console.log("Task deleted successfully:", deletedTask.title);

        res.status(200).json({
            success: true,
            message: "Task được xóa thành công",
            data: deletedTask,
        });
    } catch (error) {
        console.error("=== ERROR DELETING TASK ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi xóa task",
            error: error.message,
        });
    }
};

// @desc    Toggle trạng thái hoàn thành của task
// @route   PATCH /api/task/:id/toggle
// @access  Public
const toggleTaskComplete = async (req, res) => {
    try {
        console.log("=== TOGGLE TASK COMPLETE ===");
        console.log("Task ID:", req.params.id);

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "ID task không hợp lệ",
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task",
            });
        }

        // Toggle trạng thái
        task.is_completed = !task.is_completed;
        const updatedTask = await task.save();

        console.log(
            `Task ${updatedTask.is_completed ? "completed" : "incompleted"}:`,
            updatedTask.title
        );

        res.status(200).json({
            success: true,
            message: `Task đã được đánh dấu ${
                updatedTask.is_completed ? "hoàn thành" : "chưa hoàn thành"
            }`,
            data: updatedTask,
        });
    } catch (error) {
        console.error("=== ERROR TOGGLING TASK ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi thay đổi trạng thái task",
            error: error.message,
        });
    }
};

// @desc    Lấy thống kê tasks
// @route   GET /api/task/stats
// @access  Public
const getTaskStats = async (req, res) => {
    try {
        console.log("=== GET TASK STATS ===");

        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ is_completed: true });
        const pendingTasks = await Task.countDocuments({ is_completed: false });

        // Thống kê theo tuần này (bắt đầu từ thứ Hai)
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...

        // Tính số ngày từ thứ Hai
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - daysFromMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        console.log("Week range (Monday-Sunday):", {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString(),
            startDay: startOfWeek.toLocaleDateString("vi-VN", { weekday: "long" }),
            endDay: endOfWeek.toLocaleDateString("vi-VN", { weekday: "long" }),
        });

        const thisWeekTotal = await Task.countDocuments({
            date: { $gte: startOfWeek, $lte: endOfWeek },
        });

        const thisWeekCompleted = await Task.countDocuments({
            date: { $gte: startOfWeek, $lte: endOfWeek },
            is_completed: true,
        });

        const thisWeekPending = await Task.countDocuments({
            date: { $gte: startOfWeek, $lte: endOfWeek },
            is_completed: false,
        });

        // Thống kê hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayTotal = await Task.countDocuments({
            date: { $gte: today, $lt: tomorrow },
        });

        const todayCompleted = await Task.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            is_completed: true,
        });

        const todayPending = await Task.countDocuments({
            date: { $gte: today, $lt: tomorrow },
            is_completed: false,
        });

        const stats = {
            total: {
                all: totalTasks,
                completed: completedTasks,
                pending: pendingTasks,
            },
            thisWeek: {
                total: thisWeekTotal,
                completed: thisWeekCompleted,
                pending: thisWeekPending,
            },
            today: {
                total: todayTotal,
                completed: todayCompleted,
                pending: todayPending,
            },
            weekInfo: {
                startOfWeek: startOfWeek.toISOString(),
                endOfWeek: endOfWeek.toISOString(),
                currentDay: currentDay,
                daysFromMonday: daysFromMonday,
            },
        };

        console.log("Stats calculated:", stats);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("=== ERROR GETTING STATS ===");
        console.error("Error message:", error.message);

        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy thống kê",
            error: error.message,
        });
    }
};

// @desc    Test connection
// @route   GET /api/task/test
// @access  Public
const testConnection = async (req, res) => {
    try {
        console.log("=== TESTING DATABASE CONNECTION ===");

        // Kiểm tra connection state
        const connectionStates = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
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
            sampleTasks: allTasks,
        });
    } catch (error) {
        console.error("=== TEST CONNECTION ERROR ===");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
        });
    }
};

// @desc    Lấy tasks từ Google Calendar
// @route   GET /api/task/get-google-calendar
// @access  Public
const getTasksGoogleCalendar = async (req, res) => {
    try {
        console.log("=== GET TASKS FROM GOOGLE CALENDAR ===");

        // Thiết lập authentication
        const credentials = require(path.join(process.cwd(), process.env.GOOGLE_CREDENTIALS_PATH));

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
        });

        const calendar = google.calendar({ version: "v3", auth });

        // Lấy query parameters để filter
        const { timeMin, timeMax, maxResults = 50, singleEvents = true } = req.query;

        // Thiết lập thời gian mặc định (30 ngày tới)
        const defaultTimeMin = timeMin || new Date().toISOString();
        const defaultTimeMax =
            timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        console.log("Fetching events from:", defaultTimeMin, "to:", defaultTimeMax);

        // Tạo parameters cho API call
        const apiParams = {
            calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
            timeMin: defaultTimeMin,
            timeMax: defaultTimeMax,
            maxResults: parseInt(maxResults),
            singleEvents: singleEvents === "true" || singleEvents === true,
        };

        // Chỉ thêm orderBy nếu singleEvents = true
        if (apiParams.singleEvents) {
            apiParams.orderBy = "startTime";
        }

        console.log("API Parameters:", apiParams);

        // Gọi Google Calendar API
        const response = await calendar.events.list(apiParams);

        const events = response.data.items || [];
        console.log(`Fetched ${events.length} raw events from Google Calendar`);

        // Chuyển đổi format events thành tasks
        const tasks = events.map((event) => {
            const startTime = event.start?.dateTime || event.start?.date;
            const endTime = event.end?.dateTime || event.end?.date;

            return {
                id: event.id,
                title: event.summary || "Không có tiêu đề",
                description: event.description || "",
                date: startTime ? new Date(startTime).toISOString().split("T")[0] : null,
                time:
                    startTime && event.start?.dateTime
                        ? new Date(startTime).toTimeString().slice(0, 5)
                        : null,
                startTime: startTime,
                endTime: endTime,
                status: event.status,
                location: event.location || "",
                attendees: event.attendees || [],
                created: event.created,
                updated: event.updated,
                htmlLink: event.htmlLink,
                source: "google-calendar",
                isAllDay: !event.start?.dateTime, // true nếu là sự kiện cả ngày
            };
        });

        // Sắp xếp tasks theo thời gian bắt đầu (client-side sorting)
        tasks.sort((a, b) => {
            const timeA = new Date(a.startTime || a.date);
            const timeB = new Date(b.startTime || b.date);
            return timeA - timeB;
        });

        console.log(`Successfully processed ${tasks.length} events from Google Calendar`);

        if (tasks.length > 0) {
            console.log("Sample task:", JSON.stringify(tasks[0], null, 2));
        }

        // Khởi tạo các biến để tracking việc lưu database
        let savedTasks = [];
        let duplicateCount = 0;
        let errorCount = 0;

        // lưu các task vào database
        for (const task of tasks) {
            try {
                // Kiểm tra xem task đã tồn tại chưa (dựa trên Google Calendar ID)
                const existingTask = await Task.findOne({
                    googleCalendarId: task.id,
                });

                if (existingTask) {
                    console.log(`Task already exists: ${task.title}`);
                    duplicateCount++;
                    continue;
                }

                // Chuẩn bị dữ liệu để lưu vào database
                const taskDate = task.date ? new Date(task.date) : new Date();

                // Tạo task mới
                const newTask = await Task.create({
                    title: task.title || "Không có tiêu đề",
                    description: task.description || "",
                    date: taskDate,
                    time: task.time || "00:00",
                    is_completed: false, // Mặc định là chưa hoàn thành
                    googleCalendarId: task.id, // Lưu ID từ Google Calendar để tránh duplicate
                    source: "google-calendar", // Đánh dấu nguồn từ Google Calendar
                });

                savedTasks.push(newTask);
                console.log(`Task saved: ${newTask.title}`);
            } catch (saveError) {
                console.error(`Error saving task: ${task.title}`, saveError.message);
                errorCount++;
            }
        }

        console.log(
            `Database sync completed: ${savedTasks.length} saved, ${duplicateCount} duplicates, ${errorCount} errors`
        );

        res.status(200).json({
            success: true,
            count: tasks.length,
            timeRange: {
                from: defaultTimeMin,
                to: defaultTimeMax,
            },
            calendarInfo: {
                calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
                totalEvents: events.length,
            },
            syncInfo: {
                totalFetched: tasks.length,
                savedToDatabase: savedTasks.length,
                duplicatesSkipped: duplicateCount,
                errors: errorCount,
            },
            data: tasks,
            savedTasks: savedTasks.map((task) => ({
                id: task._id,
                title: task.title,
                date: task.date,
                time: task.time,
                googleCalendarId: task.googleCalendarId,
            })),
        });
    } catch (error) {
        console.error("=== ERROR GETTING GOOGLE CALENDAR TASKS ===");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error details:", error.errors);

        // Xử lý các lỗi phổ biến
        if (error.code === "ENOENT") {
            return res.status(500).json({
                success: false,
                message: "Không tìm thấy file credentials Google API",
                error: "Vui lòng kiểm tra đường dẫn GOOGLE_CREDENTIALS_PATH trong .env",
            });
        }

        if (error.code === 401) {
            return res.status(401).json({
                success: false,
                message: "Lỗi xác thực Google API",
                error: "Vui lòng kiểm tra credentials hoặc permissions",
            });
        }

        if (error.code === 403) {
            return res.status(403).json({
                success: false,
                message: "Không có quyền truy cập Google Calendar",
                error: "Vui lòng kiểm tra permissions của Service Account",
            });
        }

        if (error.code === 400) {
            return res.status(400).json({
                success: false,
                message: "Tham số request không hợp lệ",
                error: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy tasks từ Google Calendar",
            error: error.message,
            details: error.errors || null,
        });
    }
};

const suggestAI = async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console
    try {
        const { title, description, date } = req.body;
        // Chuẩn bị prompt cho Gemini AI
        const taskDate = new Date(date);
        const dayOfWeek = taskDate.toLocaleDateString("vi-VN", { weekday: "long" });
        const formattedDate = taskDate.toLocaleDateString("vi-VN");
        const prompt = `
Bạn là một chuyên gia quản lý thời gian. Hãy gợi ý thời điểm tốt nhất trong ngày để thực hiện công việc sau:

Thông tin công việc:
- Tiêu đề: ${title}
- Mô tả: ${description || "Không có mô tả"}
- Ngày thực hiện: ${formattedDate} (${dayOfWeek})

Yêu cầu:
1. Gợi ý 1 thời điểm cụ thể (định dạng HH:MM, 24h)
2. Giải thích lý do tại sao thời điểm này phù hợp
3. Xem xét loại công việc, thời gian trong ngày, và hiệu suất làm việc

Trả lời bằng JSON format:
{
    "recommendedTime": "HH:MM",
    "reason": "Lý do chi tiết bằng tiếng Việt",
    "confidence": 0.85,
    "workType": "loại công việc",
    "tips": "Gợi ý thêm để tối ưu hiệu suất"
}
`;
        // const response = await ai.generateContent({
        //     model: "gemini-2.5-pro",
        //     contents: prompt,
        // });
        // return res.status(200).json({
        //     success: true,
        //     message: "Gợi ý thời gian thành công",
        //     data: response,
        // });
    } catch (error) {
        console.error("Error in AI suggestion:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi khi lấy gợi ý từ AI",
            error: error.message,
        });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getTaskStats,
    testConnection,
    getTasksGoogleCalendar,
    suggestAI,
};
