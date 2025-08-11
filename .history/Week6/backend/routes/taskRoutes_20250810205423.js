const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/taskController");

// Test connection
router.get("/test", testConnection);

// Get stats
router.get("/stats", getTaskStats);

// Get all tasks
router.get("/get", getTasks);
// Get tasks from Google Calendar
router.get("/get-google-calendar", getTasksGoogleCalendar);

// Gợi ý thời gian tốt nhất để làm task
router.ps("/suggest-time", suggestAI);
// Get task by ID
router.get("/:id", getTaskById);

// Create new task
router.post("/create", createTask);

// Update task
router.put("/:id", updateTask);

// Toggle task complete status
router.patch("/:id/toggle", toggleTaskComplete);

// Delete task
router.delete("/:id", deleteTask);

module.exports = router;
