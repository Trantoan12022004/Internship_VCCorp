const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
// Tạo WebSocket server
const wss = new WebSocket.Server({ server });

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Test route để check server hoạt động
app.get("/test", (req, res) => {
    res.json({
        message: "Server đang hoạt động!",
        timestamp: new Date().toISOString(),
        connectedClients: wss.clients.size,
    });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('✅ New client connected');
    console.log(`👥 Total clients: ${wss.clients.size}`);
    
    // Test message khi client connect
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Chào mừng bạn đến với WebSocket Chat!'
    }));
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log('❌ Client disconnected');
        console.log(`👥 Total clients: ${wss.clients.size}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Test URL: http://localhost:${PORT}/test`);
});
