const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorMiddleware");
const taskRoutes = require("./routes/taskRoutes");

// Khởi tạo express app
const app = express();

// Middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes

app.use("/api/task", databaseRoutes);



// Route chính
app.get("/", (req, res) => {
    res.send("API đang chạy...");
});

// Middleware xử lý lỗi
app.use(errorHandler);

module.exports = app;
