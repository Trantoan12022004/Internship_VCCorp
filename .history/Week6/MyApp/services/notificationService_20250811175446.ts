import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Cấu hình cách hiển thị notification khi app đang mở
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface Task {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    is_completed: boolean;
}

class NotificationService {
    private async registerForPushNotificationsAsync(): Promise<string | null> {
        let token;

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                console.log("Permission not granted for notifications");
                return null;
            }

            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    throw new Error("Project ID not found");
                }
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                console.log("Expo Push Token:", token);
            } catch (e) {
                console.log("Error getting expo push token:", e);
                token = `${Date.now()}`;
            }
        } else {
            console.log("Must use physical device for Push Notifications");
        }

        return token;
    }

    // Khởi tạo notification service
    async initialize(): Promise<string | null> {
        console.log("Initializing notification service...");
        return await this.registerForPushNotificationsAsync();
    }

    // Lên lịch notification cho một task
    async scheduleTaskNotification(task: Task): Promise<string | null> {
        try {
            // Kiểm tra nếu task đã hoàn thành thì không cần schedule
            if (task.is_completed) {
                console.log(`Task ${task._id} is completed, skipping notification`);
                return null;
            }

            // Tạo date object từ task date và time
            const taskDateTime = this.createTaskDateTime(task.date, task.time);

            // Kiểm tra nếu thời gian task đã qua thì không schedule
            if (taskDateTime <= new Date()) {
                console.log(`Task ${task._id} time has passed, skipping notification`);
                return null;
            }

            // Lên lịch notification 15 phút trước task
            const notificationTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);

            // Nếu thời gian notification đã qua thì schedule ngay lập tức (cho testing)
            const scheduleTime =
                notificationTime <= new Date() ? new Date(Date.now() + 5000) : notificationTime;

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Nhắc nhở Task",
                    body: `${task.title} sẽ bắt đầu trong 15 phút`,
                    data: {
                        taskId: task._id,
                        taskTitle: task.title,
                        taskTime: task.time,
                        type: "task_reminder",
                    },
                    sound: true,
                },
                trigger: {
                    date: scheduleTime,
                },
            });

            console.log(
                `Scheduled notification for task ${task._id} at ${scheduleTime.toLocaleString()}`
            );
            return notificationId;
        } catch (error) {
            console.error("Error scheduling notification:", error);
            return null;
        }
    }

    // Lên lịch notification cho nhiều tasks
    async scheduleMultipleTaskNotifications(tasks: Task[]): Promise<void> {
        console.log(`Scheduling notifications for ${tasks.length} tasks...`);

        // Hủy tất cả notifications cũ trước
        await this.cancelAllTaskNotifications();

        // Schedule notifications cho các task chưa hoàn thành
        const activeTasks = tasks.filter((task) => !task.is_completed);

        for (const task of activeTasks) {
            await this.scheduleTaskNotification(task);
        }

        console.log(`Scheduled notifications for ${activeTasks.length} active tasks`);
    }

    // Hủy notification cho một task cụ thể
    async cancelTaskNotification(taskId: string): Promise<void> {
        try {
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

            for (const notification of scheduledNotifications) {
                if (notification.content.data?.taskId === taskId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                    console.log(`Cancelled notification for task ${taskId}`);
                }
            }
        } catch (error) {
            console.error("Error cancelling task notification:", error);
        }
    }

    // Hủy tất cả notifications liên quan đến tasks
    async cancelAllTaskNotifications(): Promise<void> {
        try {
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

            for (const notification of scheduledNotifications) {
                if (notification.content.data?.type === "task_reminder") {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            console.log("Cancelled all task notifications");
        } catch (error) {
            console.error("Error cancelling all notifications:", error);
        }
    }

    // Tạo immediate notification (để test)
    async sendImmediateNotification(title: string, body: string): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { type: "immediate" },
                sound: true,
            },
            trigger: null, // Gửi ngay lập tức
        });
    }

    // Helper function để tạo DateTime từ date và time string
    private createTaskDateTime(dateString: string, timeString: string): Date {
        // dateString format: "2025-08-08T00:00:00.000Z"
        // timeString format: "14:00"

        const date = new Date(dateString);
        const [hours, minutes] = timeString.split(":").map(Number);

        // Tạo date với local timezone
        const taskDateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours,
            minutes,
            0
        );

        return taskDateTime;
    }

    // Lấy danh sách notifications đã schedule
    async getScheduledNotifications() {
        return await Notifications.getAllScheduledNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
