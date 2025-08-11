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
    },
    {
        timestamps: true,
    }
);

const tas = mongoose.model("tasks", taskSchema);

module.exports = Task;
