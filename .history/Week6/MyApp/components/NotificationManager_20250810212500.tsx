import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { getNotifications, toggleTaskComplete } from '../sevices/api';

interface TaskNotification {
    taskId: string;
    title: string;
    taskTime: string;
    notificationTime: string;
    isActive: boolean;
    timeToNotification: string;
}

interface NotificationManagerProps {
    onTaskReminder?: (notification: TaskNotification) => void;
}

export default function NotificationManager({ onTaskReminder }: NotificationManagerProps) {
    const [notifications, setNotifications] = useState<TaskNotification[]>([]);
    const [checkedNotifications, setCheckedNotifications] = useState<Set<string>>(new Set());

    // Fetch notifications từ server
    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            if (response.data.success) {
                setNotifications(response.data.data);
                console.log(`📱 Fetched ${response.data.data.length} notifications`);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Kiểm tra notifications cần trigger
    const checkNotifications = useCallback(() => {
        const now = new Date();
        
        notifications.forEach(notification => {
            // Skip nếu đã check notification này rồi
            if (checkedNotifications.has(notification.taskId)) {
                return;
            }

            // Parse notification time
            const notificationTime = new Date(notification.notificationTime);
            
            // Kiểm tra xem đã đến giờ notification chưa (với buffer 1 phút)
            const timeDiff = notificationTime.getTime() - now.getTime();
            const isTimeToNotify = timeDiff <= 60000 && timeDiff >= -60000; // ±1 phút
            
            if (isTimeToNotify && notification.isActive) {
                showTaskReminder(notification);
                
                // Đánh dấu đã check
                setCheckedNotifications(prev => new Set([...prev, notification.taskId]));
                
                console.log(`🔔 Notification triggered for task: ${notification.title}`);
            }
        });
    }, [notifications, checkedNotifications]);

    // Hiển thị notification alert
    const showTaskReminder = (notification: TaskNotification) => {
        const message = `Task "${notification.title}" sẽ bắt đầu trong 15 phút!\n\nThời gian: ${notification.taskTime}`;
        
        Alert.alert(
            "🔔 Nhắc nhở Task",
            message,
            [
                {
                    text: "Để sau",
                    style: "cancel"
                },
                {
                    text: "Xem chi tiết",
                    onPress: () => {
                        if (onTaskReminder) {
                            onTaskReminder(notification);
                        }
                        console.log("Navigate to task:", notification.taskId);
                    }
                },
                {
                    text: "Đánh dấu hoàn thành",
                    onPress: () => {
                        handleMarkComplete(notification.taskId);
                    }
                }
            ],
            { cancelable: false }
        );
    };

    // Đánh dấu task hoàn thành
    const handleMarkComplete = async (taskId: string) => {
        try {
            // Import toggleTaskComplete từ api
            const { toggleTaskComplete } = require('../sevices/api');
            const response = await toggleTaskComplete(taskId);
            
            if (response.data.success) {
                Alert.alert("Thành công", "Task đã được đánh dấu hoàn thành!");
                // Refresh notifications
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking task complete:', error);
            Alert.alert("Lỗi", "Không thể đánh dấu task hoàn thành");
        }
    };

    // Effect để fetch notifications định kỳ
    useEffect(() => {
        // Fetch ngay lập tức
        fetchNotifications();

        // Set up interval để fetch notifications mỗi 30 giây
        const fetchInterval = setInterval(fetchNotifications, 30000);

        return () => {
            clearInterval(fetchInterval);
        };
    }, []);

    // Effect để check notifications mỗi 10 giây
    useEffect(() => {
        const checkInterval = setInterval(checkNotifications, 10000);

        return () => {
            clearInterval(checkInterval);
        };
    }, [notifications, checkedNotifications]);

    // Reset checked notifications khi notifications list thay đổi
    useEffect(() => {
        setCheckedNotifications(new Set());
    }, [notifications.length]);

    // Component này không render gì, chỉ xử lý logic
    return null;
}

// Export types để sử dụng ở components khác
export type { TaskNotification };
