const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ thông tin clients
const clients = new Map();
let messageHistory = []; // Lưu lịch sử tin nhắn

// API endpoints
app.get('/api/status', (req, res) => {
    const userCount = Array.from(clients.values()).filter(c => c.username).length;
    res.json({
        server: 'WebSocket Chat Server',
        status: 'running',
        totalConnections: wss.clients.size,
        activeUsers: userCount,
        messagesCount: messageHistory.length,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/users', (req, res) => {
    const users = Array.from(clients.values())
        .filter(c => c.username)
        .map(c => ({ username: c.username, joinTime: c.joinTime }));
    res.json({ users, count: users.length });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    const clientId = generateClientId();
    
    console.log(`✅ [${clientId}] Client kết nối từ: ${clientIP}`);
    
    // Lưu thông tin client
    clients.set(clientId, {
        ws,
        username: null,
        joinTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ip: clientIP
    });

    // Gửi welcome message
    ws.send(JSON.stringify({
        type: 'system',
        message: 'Kết nối thành công! Nhập tên để bắt đầu chat.',
        timestamp: new Date().toISOString()
    }));

    // Gửi lịch sử tin nhắn (10 tin nhắn gần nhất)
    const recentMessages = messageHistory.slice(-10);
    if (recentMessages.length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            messages: recentMessages
        }));
    }

    // Xử lý tin nhắn từ client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(clientId, data);
        } catch (error) {
            console.error(`❌ [${clientId}] Lỗi parse message:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Định dạng tin nhắn không hợp lệ'
            }));
        }
    });

    // Xử lý ngắt kết nối
    ws.on('close', () => {
        handleDisconnect(clientId);
    });

    // Xử lý lỗi
    ws.on('error', (error) => {
        console.error(`❌ [${clientId}] WebSocket error:`, error);
    });
});

function generateClientId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function handleMessage(clientId, data) {
    const client = clients.get(clientId);
    if (!client) return;

    // Cập nhật thời gian hoạt động
    client.lastActivity = new Date().toISOString();

    console.log(`📨 [${clientId}] ${data.type}:`, data);

    switch (data.type) {
        case 'setUsername':
            handleSetUsername(clientId, data.username);
            break;
        case 'message':
            handleChatMessage(clientId, data.message);
            break;
        case 'typing':
            handleTyping(clientId, data.isTyping);
            break;
        case 'ping':
            handlePing(clientId);
            break;
    }
}

function handleSetUsername(clientId, username) {
    const client = clients.get(clientId);
    if (!client) return;

    // Validate username
    if (!username || username.trim().length === 0) {
        client.ws.send(JSON.stringify({
            type: 'error',
            message: 'Tên không được để trống'
        }));
        return;
    }

    if (username.length > 20) {
        client.ws.send(JSON.stringify({
            type: 'error',
            message: 'Tên không được quá 20 ký tự'
        }));
        return;
    }

    // Kiểm tra tên đã tồn tại
    const existingUser = Array.from(clients.values()).find(c => 
        c.username && c.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
        client.ws.send(JSON.stringify({
            type: 'error',
            message: 'Tên này đã được sử dụng'
        }));
        return;
    }

    // Set username
    client.username = username.trim();
    console.log(`👤 [${clientId}] Set username: ${client.username}`);

    // Thông báo user join
    const joinMessage = {
        type: 'notification',
        message: `${client.username} đã tham gia chat`,
        timestamp: new Date().toISOString()
    };
    
    broadcast(joinMessage, clientId);
    
    // Gửi xác nhận cho user
    client.ws.send(JSON.stringify({
        type: 'usernameSet',
        username: client.username
    }));

    // Cập nhật danh sách users
    updateUserList();
}

function handleChatMessage(clientId, message) {
    const client = clients.get(clientId);
    if (!client || !client.username) return;

    if (!message || message.trim().length === 0) return;
    if (message.length > 500) {
        client.ws.send(JSON.stringify({
            type: 'error',
            message: 'Tin nhắn không được quá 500 ký tự'
        }));
        return;
    }

    const chatMessage = {
        type: 'message',
        id: generateMessageId(),
        username: client.username,
        message: message.trim(),
        timestamp: new Date().toISOString()
    };

    // Lưu vào lịch sử
    messageHistory.push(chatMessage);
    
    // Giới hạn lịch sử (chỉ lưu 100 tin nhắn gần nhất)
    if (messageHistory.length > 100) {
        messageHistory = messageHistory.slice(-100);
    }

    console.log(`💬 [${client.username}] ${message}`);

    // Broadcast tin nhắn
    broadcast(chatMessage);
}

function handleTyping(clientId, isTyping) {
    const client = clients.get(clientId);
    if (!client || !client.username) return;

    broadcast({
        type: 'typing',
        username: client.username,
        isTyping: isTyping
    }, clientId);
}

function handlePing(clientId) {
    const client = clients.get(clientId);
    if (!client) return;

    client.ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
    }));
}

function handleDisconnect(clientId) {
    const client = clients.get(clientId);
    if (!client) return;

    console.log(`❌ [${clientId}] Client ngắt kết nối`);

    if (client.username) {
        // Thông báo user leave
        broadcast({
            type: 'notification',
            message: `${client.username} đã rời khỏi chat`,
            timestamp: new Date().toISOString()
        }, clientId);
    }

    clients.delete(clientId);
    updateUserList();
}

function broadcast(data, excludeClientId = null) {
    const message = JSON.stringify(data);
    
    clients.forEach((client, clientId) => {
        if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}

function updateUserList() {
    const users = Array.from(clients.values())
        .filter(c => c.username)
        .map(c => ({
            username: c.username,
            joinTime: c.joinTime
        }));

    broadcast({
        type: 'userList',
        users: users,
        count: users.length
    });
}

function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Cleanup inactive connections
setInterval(() => {
    const now = new Date();
    clients.forEach((client, clientId) => {
        if (client.ws.readyState !== WebSocket.OPEN) {
            console.log(`🧹 Cleaning up inactive client: ${clientId}`);
            clients.delete(clientId);
        }
    });
}, 30000); // Check every 30 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket Chat Server running on port ${PORT}`);
    console.log(`📊 Status API: http://localhost:${PORT}/api/status`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`🌐 Chat App: http://localhost:${PORT}`);
});