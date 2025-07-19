import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Loading from '../../components/ui/Loading/Loading';
import {analyzeQuery} from '../../services';

const Chat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Xin chào! Tôi có thể giúp gì cho bạn?",
            sender: "system",
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Gọi API để lấy phản hồi từ hệ thống
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    userId: 'user123' // Có thể lấy từ context auth
                })
            });

            const data = await response.json();

            const systemMessage = {
                id: Date.now() + 1,
                text: data.response || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, systemMessage]);
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Xin chào! Tôi có thể giúp gì cho bạn?",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <h2>Chat Hỗ Trợ</h2>
                <Button 
                    variant="secondary" 
                    size="small"
                    onClick={clearChat}
                    className={styles.clearButton}
                >
                    Xóa Chat
                </Button>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.message} ${
                            message.sender === 'user' ? styles.userMessage : styles.systemMessage
                        }`}
                    >
                        <div className={styles.messageContent}>
                            <p className={styles.messageText}>{message.text}</p>
                            <span className={styles.messageTime}>{message.timestamp}</span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className={`${styles.message} ${styles.systemMessage}`}>
                        <div className={styles.messageContent}>
                            <Loading size="small" />
                            <span className={styles.typingIndicator}>Đang trả lời...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className={styles.inputForm}>
                <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập tin nhắn của bạn..."
                    className={styles.messageInput}
                    disabled={isLoading}
                />
                <Button 
                    type="submit" 
                    disabled={isLoading || !inputMessage.trim()}
                    className={styles.sendButton}
                >
                    Gửi
                </Button>
            </form>
        </div>
    );
};

export default Chat;