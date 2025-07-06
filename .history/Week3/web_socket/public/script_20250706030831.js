// WebSocket Chat Client
class ChatClient {
    constructor() {
        this.ws = null;
        this.username = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.typingTimeout = null;
        this.isTyping = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkServerStatus();
    }

    initializeElements() {
        // DOM elements
        this.elements = {
            loading: document.getElementById('loading'),
            loginForm: document.getElementById('loginForm'),
            chatContainer: document.getElementById('chatContainer'),
            usernameInput: document.getElementById('usernameInput'),
            joinButton: document.getElementById('joinButton'),
            serverStatus: document.getElementById('serverStatus'),
            connectionStatus: document.getElementById('connectionStatus'),
            userCount: document.getElementById('userCount'),
            userList: document.getElementById('userList'),
            messages: document.getElementById('messages'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            charCount: document.getElementById('charCount'),
            typingIndicator: document.getElementById('typingIndicator'),
            settingsPanel: document.getElementById('settingsPanel'),
            soundEnabled: document.getElementById('soundEnabled'),
            timestampEnabled: document.getElementById('timestampEnabled')
        };
    }

    setupEventListeners() {
        // Join button
        this.elements.joinButton.addEventListener('click', () => this.joinChat());
        
        // Enter key for username
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });

        // Send message
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key for message
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Character count
        this.elements.messageInput.addEventListener('input', (e) => {
            this.updateCharCount();
            this.handleTyping();
        });

        // Typing indicator
        this.elements.messageInput.addEventListener('focus', () => {
            this.handleTyping();
        });

        this.elements.messageInput.addEventListener('blur', () => {
            this.stopTyping();
        });

        // Settings
        this.elements.soundEnabled.addEventListener('change', () => {
            this.saveSettings();
        });

        this.elements.timestampEnabled.addEventListener('change', () => {
            this.saveSettings();
        });

        // Load settings
        this.loadSettings();
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            this.elements.serverStatus.textContent = 
                `Server hoạt động bình thường (${data.activeUsers} người online)`;
            this.elements.serverStatus.style.color = '#28a745';
        } catch (error) {
            this.elements.serverStatus.textContent = 'Không thể kết nối đến server';
            this.elements.serverStatus.style.color = '#dc3545';
        }
        
        // Hide loading, show login
        this.elements.loading.classList.add('hidden');
        this.elements.loginForm.classList.remove('hidden');
    }

    joinChat() {
        const username = this.elements.usernameInput.value.trim();
        
        if (!username) {
            this.showError('Vui lòng nhập tên của bạn');
            return;
        }

        if (username.length > 20) {
            this.showError('Tên không được quá 20 ký tự');
            return;
        }

        this.username = username;
        this.connectWebSocket();
    }

    connectWebSocket() {
        if (this.ws) {
            this.ws.close();
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        console.log('Connecting to:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('online');
            
            // Send username
            this.sendData({
                type: 'setUsername',
                username: this.username
            });
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('❌ WebSocket disconnected');
            this.isConnected = false;
            this.updateConnectionStatus('offline');
            
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.reconnect(), this.reconnectDelay);
            } else {
                this.showError('Kết nối bị ngắt. Vui lòng refresh trang.');
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showError('Lỗi kết nối WebSocket');
        };
    }

    reconnect() {
        if (this.isConnected) return;
        
        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.connectWebSocket();
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
    }

    sendData(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    handleMessage(data) {
        console.log('📨 Received:', data);
        
        switch (data.type) {
            case 'system':
                this.showSystemMessage(data.message);
                break;
            case 'usernameSet':
                this.showChatInterface();
                break;
            case 'message':
                this.showChatMessage(data);
                break;
            case 'notification':
                this.showNotification(data.message);
                break;
            case 'userList':
                this.updateUserList(data.users, data.count);
                break;
            case 'history':
                this.showMessageHistory(data.messages);
                break;
            case 'typing':
                this.showTypingIndicator(data.username, data.isTyping);
                break;
            case 'error':
                this.showError(data.message);
                break;
            case 'pong':
                console.log('🏓 Pong received');
                break;
        }
    }

    showChatInterface() {
        this.elements.loginForm.classList.add('hidden');
        this.elements.chatContainer.classList.remove('hidden');
        this.elements.messageInput.focus();
        
        // Start ping interval
        this.startPingInterval();
    }

    showSystemMessage(message) {
        this.addMessage({
            type: 'system',
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    showChatMessage(data) {
        this.addMessage({
            type: 'message',
            username: data.username,
            message: data.message,
            timestamp: data.timestamp,
            isOwn: data.username === this.username
        });
        
        // Play sound if enabled
        if (this.elements.soundEnabled.checked && data.username !== this.username) {
            this.playNotificationSound();
        }
    }

    showNotification(message) {
        this.addMessage({
            type: 'notification',
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    showMessageHistory(messages) {
        messages.forEach(msg => {
            this.addMessage({
                type: 'message',
                username: msg.username,
                message: msg.message,
                timestamp: msg.timestamp,
                isOwn: msg.username === this.username,
                isHistory: true
            });
        });
    }

    addMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.type}`;
        
        if (data.isOwn) {
            messageDiv.classList.add('own');
        } else if (data.type === 'message') {
            messageDiv.classList.add('other');
        }

        if (data.isHistory) {
            messageDiv.style.opacity = '0.7';
        }

        let content = '';
        
        if (data.type === 'message') {
            const showTimestamp = this.elements.timestampEnabled.checked;
            const time = showTimestamp ? this.formatTime(data.timestamp) : '';
            
            content = `
                <div class="message-header">
                    <span class="message-username">${this.escapeHtml(data.username)}</span>
                    ${time ? `<span class="message-time">${time}</span>` : ''}
                </div>
                <div class="message-content">${this.escapeHtml(data.message)}</div>
            `;
        } else {
            content = `<div class="message-content">${this.escapeHtml(data.message)}</div>`;
        }

        messageDiv.innerHTML = content;
        this.elements.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    updateUserList(users, count) {
        this.elements.userCount.textContent = `${count} người online`;
        
        if (users.length === 0) {
            this.elements.userList.innerHTML = '<div class="no-users">Chưa có người dùng nào</div>';
            return;
        }

        this.elements.userList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <span class="user-name">${this.escapeHtml(user.username)}</span>
            </div>
        `).join('');
    }

    showTypingIndicator(username, isTyping) {
        if (username === this.username) return;
        
        if (isTyping) {
            this.elements.typingIndicator.innerHTML = `
                <span>${this.escapeHtml(username)} đang nhập</span>
                <span class="typing-dots">
                    <span></span><span></span><span></span>
                </span>
            `;
            this.elements.typingIndicator.classList.remove('hidden');
        } else {
            this.elements.typingIndicator.classList.add('hidden');
        }
    }

    sendMessage() {
        const message = this.elements.messageInput.value.trim();
        
        if (!message) return;
        if (!this.isConnected) {
            this.showError('Không có kết nối');
            return;
        }

        if (this.sendData({
            type: 'message',
            message: message
        })) {
            this.elements.messageInput.value = '';
            this.updateCharCount();
            this.stopTyping();
        }
    }

    handleTyping() {
        if (!this.isConnected) return;
        
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendData({
                type: 'typing',
                isTyping: true
            });
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendData({
                type: 'typing',
                isTyping: false
            });
        }
        clearTimeout(this.typingTimeout);
    }

    updateCharCount() {
        const length = this.elements.messageInput.value.length;
        this.elements.charCount.textContent = `${length}/500`;
        
        if (length > 450) {
            this.elements.charCount.style.color = '#dc3545';
        } else {
            this.elements.charCount.style.color = '#6c757d';
        }
    }

    updateConnectionStatus(status) {
        this.elements.connectionStatus.textContent = status === 'online' ? 'Online' : 'Offline';
        this.elements.connectionStatus.className = `status ${status}`;
    }

    startPingInterval() {
        setInterval(() => {
            if (this.isConnected) {
                this.sendData({ type: 'ping' });
            }
        }, 30000); // Ping every 30 seconds
    }

    playNotificationSound() {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Cannot play notification sound:', error);
        }
    }

    saveSettings() {
        const settings = {
            soundEnabled: this.elements.soundEnabled.checked,
            timestampEnabled: this.elements.timestampEnabled.checked
        };
        localStorage.setItem('chatSettings', JSON.stringify(settings));
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
            this.elements.soundEnabled.checked = settings.soundEnabled !== false;
            this.elements.timestampEnabled.checked = settings.timestampEnabled !== false;
        } catch (error) {
            console.log('Cannot load settings:', error);
        }
    }

    showError(message) {
        // Create error toast
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    scrollToBottom() {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for HTML onclick events
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('show');
}

// Initialize chat client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatClient = new ChatClient();
});