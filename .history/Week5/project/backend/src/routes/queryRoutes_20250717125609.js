const express = require("express");
const router = express.Router();

// Middleware cho validation request
const validateQuery = (req, res, next) => {
    const { naturalLanguageQuery } = req.body;

    if (!naturalLanguageQuery || typeof naturalLanguageQuery !== "string") {
        return res.status(400).json({
            error: "Invalid request",
            message: "naturalLanguageQuery is required and must be a string",
        });
    }

    if (naturalLanguageQuery.trim().length === 0) {
        return res.status(400).json({
            error: "Invalid request",
            message: "naturalLanguageQuery cannot be empty",
        });
    }

    if (naturalLanguageQuery.length > 1000) {
        return res.status(400).json({
            error: "Invalid request",
            message: "naturalLanguageQuery is too long (max 1000 characters)",
        });
    }

    next();
};

// POST /api/query/process - Xử lý natural language query
router.post("/process", validateQuery, async (req, res) => {
    try {
        const { naturalLanguageQuery } = req.body;

        console.log(`📝 Processing query: ${naturalLanguageQuery}`);

        // TODO: Sẽ tích hợp Gemini API ở đây
        // Hiện tại return mock response
        const mockResponse = {
            originalQuery: naturalLanguageQuery,
            status: "received",
            message: "Query received and will be processed",
            timestamp: new Date().toISOString(),
        };

        res.json(mockResponse);
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({
            error: "Processing failed",
            message: "Unable to process your query at this time",
        });
    }
});

// GET /api/query/status/:queryId - Kiểm tra trạng thái query (cho future use)
router.get("/status/:queryId", (req, res) => {
    const { queryId } = req.params;

    // TODO: Implement query status tracking
    res.json({
        queryId,
        status: "processing",
        message: "Query status endpoint - to be implemented",
    });
});

module.exports = router;
