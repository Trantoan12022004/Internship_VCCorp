const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        is_completed: {
            type: Boolean,
            default: false,
        },
        googleCalendarId: {
            type: String,
            unique: true,
            sparse: true, // Cho phép null, nhưng nếu có giá trị thì phải unique
        },
        source: {
            type: String,
            enum: ["manual", "google-calendar"],
            default: "manual",
        },
    },
    {
        timestamps: true,
        collection: "tasks", // Chỉ collection name
    }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
