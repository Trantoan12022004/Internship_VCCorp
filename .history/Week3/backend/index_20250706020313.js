const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
// Tạo WebSocket server


// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Test route để check server hoạt động
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Server đang hoạt động!', 
        timestamp: new Date().toISOString() 
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Test URL: http://localhost:${PORT}/test`);
});