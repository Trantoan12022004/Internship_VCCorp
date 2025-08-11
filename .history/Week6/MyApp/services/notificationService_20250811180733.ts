import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Cấu hình cách hiển thị notification khi app đang foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
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
    private static instance: NotificationService;

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // Yêu cầu quyền notification
    async requestPermissions(): Promise<boolean> {
        try {
            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== "granted") {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== "granted") {
                    console.log("Failed to get push token for push notification!");
                    return false;
                }

                // Cấu hình notification channel cho Android
                if (Platform.OS === "android") {
                    await Notifications.setNotificationChannelAsync("task-reminders", {
                        name: "Task Reminders",
                        importance: Notifications.AndroidImportance.HIGH,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: "#4566EC",
                        sound: "default",
                    });
                }

                return true;
            } else {
                console.log("Must use physical device for Push Notifications");
                return false;
            }
        } catch (error) {
            console.error("Error requesting notification permissions:", error);
            return false;
        }
    }

    // Lên lịch notification cho một task
    async scheduleTaskNotification(task: Task): Promise<string | null> {
        try {
            // Parse ngày và giờ của task
            const taskDate = new Date(task.date);
            const [hours, minutes] = task.time.split(":").map(Number);

            // Tạo datetime chính xác của task
            const taskDateTime = new Date(taskDate);
            taskDateTime.setHours(hours, minutes, 0, 0);

            // Tính thời gian notification (15 phút trước)
            const notificationTime = new Date(taskDateTime.getTime() - 15 * 60 * 1000);

            // Kiểm tra xem thời gian notification có trong tương lai không
            const now = new Date();
            if (notificationTime <= now) {
                console.log(`Notification time for task ${task.title} is in the past, skipping...`);
                return null;
            }

            console.log(
                `Scheduling notification for task "${
                    task.title
                }" at ${notificationTime.toLocaleString()}`
            );

            // Lên lịch notification
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "📋 Task Reminder",
                    body: `"${task.title}" sẽ bắt đầu trong 15 phút`,
                    data: {
                        taskId: task._id,
                        taskTitle: task.title,
                        taskTime: task.time,
                    },
                    sound: "default",
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    date: notificationTime,
                },
            });

            console.log(`Notification scheduled with ID: ${notificationId}`);
            return notificationId;
        } catch (error) {
            console.error("Error scheduling notification:", error);
            return null;
        }
    }

    // Lên lịch notifications cho nhiều tasks
    async scheduleTasksNotifications(tasks: Task[]): Promise<void> {
        try {
            // Hủy tất cả notifications đã lên lịch trước đó
            await this.cancelAllTaskNotifications();

            // Lọc ra các task chưa hoàn thành của ngày hôm nay
            const today = new Date();
            const todayString = today.toISOString().split("T")[0];

            const todayTasks = tasks.filter((task) => {
                const taskDateString = task.date.split("T")[0];
                return taskDateString === todayString && !task.is_completed && task.time;
            });

            console.log(`Found ${todayTasks.length} tasks for today to schedule notifications`);

            // Lên lịch notification cho từng task
            for (const task of todayTasks) {
                await this.scheduleTaskNotification(task);
            }

            console.log(`Scheduled notifications for ${todayTasks.length} tasks`);
        } catch (error) {
            console.error("Error scheduling tasks notifications:", error);
        }
    }

    // Hủy notification của một task cụ thể
    async cancelTaskNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`Cancelled notification: ${notificationId}`);
        } catch (error) {
            console.error("Error cancelling notification:", error);
        }
    }

    // Hủy tất cả notifications đã lên lịch
    async cancelAllTaskNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log("Cancelled all scheduled notifications");
        } catch (error) {
            console.error("Error cancelling all notifications:", error);
        }
    }

    // Lấy danh sách tất cả notifications đã lên lịch
    async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
        try {
            const notifications = await Notifications.getAllScheduledNotificationsAsync();
            console.log(`Found ${notifications.length} scheduled notifications`);
            return notifications;
        } catch (error) {
            console.error("Error getting scheduled notifications:", error);
            return [];
        }
    }

    // Xử lý khi task được hoàn thành - hủy notification
    async handleTaskCompleted(taskId: string): Promise<void> {
        try {
            const scheduledNotifications = await this.getScheduledNotifications();

            // Tìm notification có taskId tương ứng
            for (const notification of scheduledNotifications) {
                if (notification.content.data?.taskId === taskId) {
                    await this.cancelTaskNotification(notification.identifier);
                    console.log(`Cancelled notification for completed task: ${taskId}`);
                    break;
                }
            }
        } catch (error) {
            console.error("Error handling task completion:", error);
        }
    }
}

export default NotificationService;
