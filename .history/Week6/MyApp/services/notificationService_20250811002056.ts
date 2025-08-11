import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface Task {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    is_completed: boolean;
}

// Cấu hình notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class NotificationService {
    private expoPushToken: string | null = null;

    constructor() {
        this.initialize();
    }

    // Khởi tạo và đăng ký push token
    initialize = async () => {
        try {
            await this.registerForPushNotificationsAsync();
            this.setupNotificationListeners();
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    };

    // Đăng ký push notifications
    registerForPushNotificationsAsync = async (): Promise<string | null> => {
        let token = null;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('task-reminders', {
                name: 'Task Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4566EC',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            try {
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                })).data;
                console.log('Expo Push Token:', token);
                this.expoPushToken = token;
            } catch (e) {
                console.error('Error getting push token:', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    };

    // Lắng nghe notifications
    setupNotificationListeners = () => {
        // Khi nhận notification trong app
        Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        // Khi user tương tác với notification
        Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            const data = response.notification.request.content.data;
            
            if (data?.taskId) {
                // Navigate to task detail hoặc xử lý theo ý muốn
                console.log('User tapped on task notification:', data.taskId);
            }
        });
    };

    // Lên lịch local notification cho task
    scheduleTaskReminder = async (task: Task) => {
        if (task.is_completed) {
            console.log('Task is completed, skipping notification');
            return;
        }

        try {
            const taskDateTime = this.parseTaskDateTime(task.date, task.time);
            if (!taskDateTime) {
                console.log('Invalid task date/time');
                return;
            }

            // Tính thời gian nhắc nhở (15 phút trước)
            const reminderTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);
            const now = new Date();

            if (reminderTime <= now) {
                console.log('Reminder time has passed');
                return;
            }

            const notificationId = `task_${task._id}`;

            await Notifications.scheduleNotificationAsync({
                identifier: notificationId,
                content: {
                    title: '⏰ Task Reminder',
                    body: `"${task.title}" sẽ bắt đầu trong 15 phút`,
                    data: {
                        taskId: task._id,
                        taskTitle: task.title,
                        taskTime: task.time,
                    },
                    sound: 'default',
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: 'task-reminder',
                },
                trigger: {
                    date: reminderTime,
                },
            });

            console.log(`Local notification scheduled for task "${task.title}" at ${reminderTime.toLocaleString()}`);

            // Gửi thông tin lên server để schedule push notification
            await this.scheduleServerNotification(task, reminderTime);

        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    };

    // Gửi yêu cầu lên server để schedule push notification
    scheduleServerNotification = async (task: Task, reminderTime: Date) => {
        if (!this.expoPushToken) {
            console.log('No push token available');
            return;
        }

        try {
            // Gọi API backend để schedule notification
            const response = await fetch('YOUR_BACKEND_URL/api/notifications/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskId: task._id,
                    pushToken: this.expoPushToken,
                    title: '⏰ Task Reminder',
                    body: `"${task.title}" sẽ bắt đầu trong 15 phút`,
                    scheduledTime: reminderTime.toISOString(),
                    data: {
                        taskId: task._id,
                        taskTitle: task.title,
                        taskTime: task.time,
                    },
                }),
            });

            if (response.ok) {
                console.log('Server notification scheduled successfully');
            } else {
                console.error('Failed to schedule server notification');
            }
        } catch (error) {
            console.error('Error scheduling server notification:', error);
        }
    };

    // Schedule nhiều tasks
    scheduleMultipleTaskReminders = async (tasks: Task[]) => {
        console.log(`Scheduling reminders for ${tasks.length} tasks`);
        
        // Hủy tất cả notifications cũ
        await this.cancelAllNotifications();
        
        // Schedule từng task
        for (const task of tasks) {
            await this.scheduleTaskReminder(task);
        }
    };

    // Hủy notification cho một task
    cancelTaskReminder = async (taskId: string) => {
        try {
            const notificationId = `task_${taskId}`;
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            
            // Hủy trên server
            await this.cancelServerNotification(taskId);
            
            console.log(`Cancelled notification for task ${taskId}`);
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    };

    // Hủy notification trên server
    cancelServerNotification = async (taskId: string) => {
        try {
            await fetch(`YOUR_BACKEND_URL/api/notifications/cancel/${taskId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error cancelling server notification:', error);
        }
    };

    // Hủy tất cả notifications
    cancelAllNotifications = async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('All notifications cancelled');
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    };

    // Test notification
    sendTestNotification = async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Test Notification 📬',
                body: 'This is a test notification!',
                data: { test: true },
            },
            trigger: { seconds: 1 },
        });
    };

    // Parse task datetime
    private parseTaskDateTime = (dateString: string, timeString: string): Date | null => {
        try {
            const datePart = dateString.split('T')[0];
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timeString.split(':').map(Number);
            
            const taskDate = new Date(year, month - 1, day, hours, minutes);
            
            if (isNaN(taskDate.getTime())) {
                throw new Error('Invalid date');
            }
            
            return taskDate;
        } catch (error) {
            console.error('Error parsing task date/time:', error);
            return null;
        }
    };

    // Get push token
    getPushToken = (): string | null => {
        return this.expoPushToken;
    };
}

export default new NotificationService();