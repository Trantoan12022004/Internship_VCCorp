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

<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .connected { background-color: #d4edda; color: #155724; }
        .disconnected { background-color: #f8d7da; color: #721c24; }
        .message { background-color: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>WebSocket Connection Test</h1>
    <div id="status" class="status disconnected">Disconnected</div>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
    <h3>Messages:</h3>
    <div id="messages"></div>

    <script>
        let ws;
        const statusDiv = document.getElementById('status');
        const messagesDiv = document.getElementById('messages');

        function connect() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                statusDiv.textContent = 'Connected';
                statusDiv.className = 'status connected';
                addMessage('✅ Connected to WebSocket server');
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                addMessage(`📨 Received: ${data.message}`);
            };
            
            ws.onclose = () => {
                statusDiv.textContent = 'Disconnected';
                statusDiv.className = 'status disconnected';
                addMessage('❌ Disconnected from WebSocket server');
            };
            
            ws.onerror = (error) => {
                addMessage(`❌ Error: ${error.message}`);
            };
        }

        function disconnect() {
            if (ws) {
                ws.close();
            }
        }

        function addMessage(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    </script>
</body>
</html>
