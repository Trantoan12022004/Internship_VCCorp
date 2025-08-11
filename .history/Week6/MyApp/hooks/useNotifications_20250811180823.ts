rant\Documents\Thực tập doanh nghiệp\Week6\MyApp\hooks\useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/notificationServic';

interface Task {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  is_completed: boolean;
}

export const useNotifications = (tasks: Task[]) => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Khởi tạo notifications
    const initNotifications = async () => {
      const hasPermission = await notificationService.requestPermissions();
      
      if (hasPermission) {
        // Lắng nghe notification events
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          // Handle notification tap
          const taskId = response.notification.request.content.data?.taskId;
          if (taskId) {
            console.log('User tapped notification for task:', taskId);
          }
        });
      }
    };

    initNotifications();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Schedule notifications khi tasks thay đổi
  useEffect(() => {
    if (tasks.length > 0) {
      notificationService.scheduleTasksNotifications(tasks);
    }
  }, [tasks]);

  return {
    scheduleNotifications: (taskList: Task[]) => notificationService.scheduleTasksNotifications(taskList),
    cancelAllNotifications: () => notificationService.cancelAllTaskNotifications(),
    handleTaskCompleted: (taskId: string) => notificationService.handleTaskCompleted(taskId),
  };
};