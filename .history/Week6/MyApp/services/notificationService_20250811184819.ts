import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Cấu hình hành vi của notification
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true, // Hiển thị alert
        shouldPlaySound: true, // Phát âm thanh
        shouldSetBadge: false, // Không hiển thị badge
    }),
});

interface Task {
    id: string;
    title: string;
    datetime: Date;
    description?: string;
}

class NotificationService {
    // Đăng ký push notification permissions
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === "android") {
            // Tạo notification channel cho Android
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        if (Device.isDevice) {
            // Yêu cầu quyền notification
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                alert("Failed to get push token for push notification!");
                return;
            }

            // Lấy push token (nếu cần gửi từ server)
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log("Push token:", token);
        } else {
            alert("Must use physical device for Push Notifications");
        }

        return token;
    }

    // Tính toán thời gian notification (15 phút trước task)
    calculateNotificationTime(taskDateTime: Date): Date {
        const notificationTime = new Date(taskDateTime);
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        return notificationTime;
    }

    // Lên lịch notification cho một task
    async scheduleTaskNotification(task: Task): Promise<string | null> {
        const notificationTime = this.calculateNotificationTime(task.datetime);
        const now = new Date();

        // Kiểm tra xem thời gian thông báo có trong tương lai không
        if (notificationTime <= now) {
            console.log(`Task ${task.title} notification time has passed`);
            return null;
        }

        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🔔 Nhắc nhở Task",
                    body: `Task "${task.title}" sẽ bắt đầu trong 15 phút`,
                    data: {
                        taskId: task.id,
                        taskTitle: task.title,
                        taskTime: task.datetime.toISOString(),
                    },
                    sound: true,
                },
                trigger: {
                    date: notificationTime,
                },
            });

            console.log(
                `Scheduled notification for task "${
                    task.title
                }" at ${notificationTime.toLocaleString()}`
            );
            return notificationId;
        } catch (error) {
            console.error("Error scheduling notification:", error);
            return null;
        }
    }

    // Lên lịch notification cho nhiều tasks
    async scheduleMultipleTaskNotifications(tasks: Task[]): Promise<string[]> {
        const notificationIds: string[] = [];

        for (const task of tasks) {
            const id = await this.scheduleTaskNotification(task);
            if (id) {
                notificationIds.push(id);
            }
        }

        return notificationIds;
    }

    // Hủy notification theo ID
    async cancelNotification(notificationId: string) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    // Hủy tất cả notifications
    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    // Lấy danh sách notifications đã lên lịch
    async getScheduledNotifications() {
        return await Notifications.getAllScheduledNotificationsAsync();
    }

    // Xử lý khi user tap vào notification
    setupNotificationResponseListener() {
        return Notifications.addNotificationResponseReceivedListener((response) => {
            const { taskId, taskTitle } = response.notification.request.content.data as {
                taskId: string;
                taskTitle: string;
            };

            console.log(`User tapped notification for task: ${taskTitle}`);
            // Có thể navigate đến task detail screen
            // navigation.navigate('TaskDetail', { taskId });
        });
    }
}

export default new NotificationService();
