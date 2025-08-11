import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';

interface Task {
  id: string;
  title: string;
  datetime: Date;
  description?: string;
  notificationId?: string;
}

export const useTaskNotifications = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks từ AsyncStorage
  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          datetime: new Date(task.datetime)
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, []);

  // Save tasks to AsyncStorage
  const saveTasks = useCallback(async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, []);

  // Thêm task mới và lên lịch notification
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'notificationId'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    };

    // Lên lịch notification
    const notificationId = await notificationService.scheduleTaskNotification(newTask);
    if (notificationId) {
      newTask.notificationId = notificationId;
    }

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  // Cập nhật task và notification
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        // Hủy notification cũ nếu có
        if (task.notificationId) {
          notificationService.cancelNotification(task.notificationId);
        }
        
        // Lên lịch notification mới nếu datetime thay đổi
        if (updates.datetime) {
          notificationService.scheduleTaskNotification(updatedTask).then(notificationId => {
            if (notificationId) {
              updatedTask.notificationId = notificationId;
              saveTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
            }
          });
        }
        
        return updatedTask;
      }
      return task;
    });
    
    await saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  // Xóa task và hủy notification
  const deleteTask = useCallback(async (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete?.notificationId) {
      await notificationService.cancelNotification(taskToDelete.notificationId);
    }
    
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    await saveTasks(filteredTasks);
  }, [tasks, saveTasks]);

  // Lên lịch lại tất cả notifications (gọi khi app restart)
  const rescheduleAllNotifications = useCallback(async () => {
    // Hủy tất cả notifications cũ
    await notificationService.cancelAllNotifications();
    
    // Lên lịch lại cho các tasks còn hiệu lực
    const updatedTasks = await Promise.all(
      tasks.map(async task => {
        const notificationId = await notificationService.scheduleTaskNotification(task);
        return notificationId ? { ...task, notificationId } : task;
      })
    );
    
    setTasks(updatedTasks);
  }, [tasks]);

  // Lọc tasks trong ngày hiện tại
  const getTodayTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.datetime);
      return taskDate >= today && taskDate < tomorrow;
    });
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Reschedule notifications khi app active lại
  useEffect(() => {
    if (tasks.length > 0) {
      rescheduleAllNotifications();
    }
  }, []);

  return {
    tasks,
    todayTasks: getTodayTasks(),
    addTask,
    updateTask,
    deleteTask,
    rescheduleAllNotifications,
  };
};