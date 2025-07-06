const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Store connected clients
const clients = new Map();

// API endpoint để check status
app.get("/api/status", (req, res) => {
    res.json({
        server: "WebSocket Chat Server",
        status: "running",
        connectedClients: clients.size,
        timestamp: new Date().toISOString(),
    });
});

wss.on("connection", (ws) => {
    console.log("✅ New client connected");

    // Tạo client ID
    const clientId = Date.now() + Math.random();
    clients.set(clientId, { ws, username: null });

    // Gửi welcome message
    ws.send(
        JSON.stringify({
            type: "system",
            message: "Kết nối thành công! Nhập tên để bắt đầu chat.",
        })
    );

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(clientId, data);
        } catch (error) {
            console.error("❌ Error parsing message:", error);
        }
    });

    ws.on("close", () => {
        handleDisconnect(clientId);
    });
});

function handleMessage(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;

    switch (data.type) {
        case "setUsername":
            client.username = data.username;
            broadcast({
                type: "system",
                message: `${data.username} đã tham gia chat`,
                timestamp: new Date().toISOString(),
            });
            updateUserCount();
            break;

        case "message":
            if (client.username) {
                broadcast({
                    type: "message",
                    username: client.username,
                    message: data.message,
                    timestamp: new Date().toISOString(),
                });
            }
            break;
    }
}

function handleDisconnect(clientId) {
    const client = clients.get(clientId);
    if (client && client.username) {
        broadcast({
            type: "system",
            message: `${client.username} đã rời khỏi chat`,
            timestamp: new Date().toISOString(),
        });
    }
    clients.delete(clientId);
    updateUserCount();
}

function broadcast(data) {
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    });
}

function updateUserCount() {
    const userCount = Array.from(clients.values()).filter((c) => c.username).length;
    broadcast({
        type: "userCount",
        count: userCount,
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Status API: http://localhost:${PORT}/api/status`);
    console.log(`🧪 Test page: http://localhost:${PORT}/test.html`);
});
