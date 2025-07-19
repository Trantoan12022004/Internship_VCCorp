import React, { useState, useRef, useEffect } from 'react';
import { analyzeQuery } from '../../services/api';
import styles from './Chat.module.css';
import Button from '../../components/ui/Button/Button';
import Loading from '../../components/ui/Loading/Loading';
import Card from '../../components/ui/Card/Card';

const Chat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Xin chào! Tôi có thể giúp bạn phân tích dữ liệu. Hãy đặt câu hỏi về dữ liệu của bạn.",
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
        const currentMessage = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            // Gọi API analyzeQuery
            const response = await analyzeQuery({ 
                query: currentMessage 
            });

            const systemMessage = {
                id: Date.now() + 1,
                text: response.data.answer || response.data.message || response.data.response || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, systemMessage]);
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: error.response?.data?.message || "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Xin chào! Tôi có thể giúp bạn phân tích dữ liệu. Hãy đặt câu hỏi về dữ liệu của bạn.",
                sender: "system",
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    };

    return (
        <div className={styles.chatContainer}>
            <Card 
                title="AI Data Assistant" 
                className={styles.chatCard}
            >
                <div className={styles.chatHeader}>
                    <Button 
                        variant="secondary" 
                        size="small"
                        onClick={clearChat}
                        className={styles.clearButton}
                    >
                        Xóa cuộc trò chuyện
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
                                <Loading size="small" text="Đang phân tích..." />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className={styles.inputForm}>
                    <div className={styles.inputContainer}>
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập câu hỏi của bạn về dữ liệu..."
                            className={styles.messageInput}
                            rows="1"
                            disabled={isLoading}
                        />
                        <Button 
                            type="submit" 
                            disabled={isLoading || !inputMessage.trim()}
                            className={styles.sendButton}
                            size="medium"
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Chat;