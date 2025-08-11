import PushNotification, { Importance } from "react-native-push-notification";
import { Platform } from "react-native";

export interface Task {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    is_completed: boolean;
}

class NotificationService {
    constructor() {
        this.configure();
        this.createDefaultChannels();
    }

    configure = () => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("TOKEN:", token);
            },

            onNotification: function (notification) {
                console.log("NOTIFICATION:", notification);
                if (notification.userInteraction) {
                    // Người dùng đã tương tác với notification
                    console.log("User interacted with notification");
                }
            },

            onAction: function (notification) {
                console.log("ACTION:", notification.action);
                console.log("NOTIFICATION:", notification);
            },

            onRegistrationError: function (err) {
                console.error(err.message, err);
            },

            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            popInitialNotification: true,
            requestPermissions: Platform.OS === "ios",
        });
    };

    createDefaultChannels = () => {
        PushNotification.createChannel(
            {
                channelId: "task-reminder",
                channelName: "Task Reminders",
                channelDescription: "Notifications for upcoming tasks",
                soundName: "default",
                importance: Importance.HIGH,
                vibrate: true,
            },
            (created) => console.log(`createChannel 'task-reminder' returned '${created}'`)
        );
    };

    scheduleTaskReminder = (task: Task) => {
        if (task.is_completed) {
            console.log("Task is already completed, skipping notification");
            return;
        }

        // Parse task date and time
        const taskDateTime = this.parseTaskDateTime(task.date, task.time);
        if (!taskDateTime) {
            console.log("Invalid task date/time, skipping notification");
            return;
        }

        // Calculate reminder time (15 minutes before)
        const reminderTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);
        const now = new Date();

        // Chỉ schedule nếu reminder time chưa qua
        if (reminderTime <= now) {
            console.log("Reminder time has passed, skipping notification");
            return;
        }

        const notificationId = `task_${task._id}`;

        PushNotification.localNotificationSchedule({
            id: notificationId,
            channelId: "task-reminder",
            title: "⏰ Task Reminder",
            message: `"${task.title}" sẽ bắt đầu trong 15 phút`,
            date: reminderTime,
            soundName: "default",
            playSound: true,
            vibrate: true,
            vibration: 300,
            actions: ["Xem Task", "Đánh dấu hoàn thành"],
            userInfo: {
                taskId: task._id,
                taskTitle: task.title,
                taskTime: task.time,
            },
            bigText: task.description || `Task "${task.title}" sẽ bắt đầu lúc ${task.time}`,
            subText: `Thời gian: ${this.formatDateTime(taskDateTime)}`,
            priority: "high",
            importance: "high",
            allowWhileIdle: true,
        });

        console.log(
            `Scheduled reminder for task "${task.title}" at ${reminderTime.toLocaleString()}`
        );
    };

    scheduleMultipleTaskReminders = (tasks: Task[]) => {
        console.log(`Scheduling reminders for ${tasks.length} tasks`);

        // Clear existing notifications first
        this.cancelAllTaskReminders();

        tasks.forEach((task) => {
            this.scheduleTaskReminder(task);
        });
    };

    cancelTaskReminder = (taskId: string) => {
        const notificationId = `task_${taskId}`;
        PushNotification.cancelLocalNotifications({ id: notificationId });
        console.log(`Cancelled reminder for task ${taskId}`);
    };

    cancelAllTaskReminders = () => {
        PushNotification.cancelAllLocalNotifications();
        console.log("Cancelled all task reminders");
    };

    private parseTaskDateTime = (dateString: string, timeString: string): Date | null => {
        try {
            // Parse date (YYYY-MM-DD format)
            const datePart = dateString.split("T")[0];
            const [year, month, day] = datePart.split("-").map(Number);

            // Parse time (HH:MM format)
            const [hours, minutes] = timeString.split(":").map(Number);

            // Create date object
            const taskDate = new Date(year, month - 1, day, hours, minutes);

            if (isNaN(taskDate.getTime())) {
                throw new Error("Invalid date");
            }

            return taskDate;
        } catch (error) {
            console.error("Error parsing task date/time:", error);
            return null;
        }
    };

    private formatDateTime = (date: Date): string => {
        return date.toLocaleString("vi-VN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Test notification
    showTestNotification = () => {
        PushNotification.localNotification({
            channelId: "task-reminder",
            title: "Test Notification",
            message: "This is a test notification!",
        });
    };

    // Check notification permissions
    checkPermissions = (callback: (permissions: any) => void) => {
        PushNotification.checkPermissions(callback);
    };

    // Request permissions (iOS)
    requestPermissions = () => {
        return PushNotification.requestPermissions();
    };
}

export default new NotificationService();
