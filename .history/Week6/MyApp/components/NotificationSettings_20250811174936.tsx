rant\Documents\Thực tập doanh nghiệp\Week6\MyApp\components\NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

interface NotificationSettingsProps {
  tasks: any[];
}

export default function NotificationSettings({ tasks }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      const minutes = await AsyncStorage.getItem('reminderMinutes');
      
      if (enabled !== null) {
        setNotificationsEnabled(enabled === 'true');
      }
      if (minutes !== null) {
        setReminderMinutes(parseInt(minutes));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (enabled: boolean, minutes: number) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
      await AsyncStorage.setItem('reminderMinutes', minutes.toString());
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveSettings(value, reminderMinutes);
    
    if (value) {
      // Re-schedule notifications
      await notificationService.scheduleMultipleTaskNotifications(tasks);
      Alert.alert('Thành công', 'Đã bật thông báo nhắc nhở');
    } else {
      // Cancel all notifications
      await notificationService.cancelAllTaskNotifications();
      Alert.alert('Thành công', 'Đã tắt thông báo nhắc nhở');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Nhắc nhở Task</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#C0C0C0', true: '#4566EC' }}
          thumbColor={notificationsEnabled ? '#FFFFFF' : '#F4F3F4'}
        />
      </View>
      
      {notificationsEnabled && (
        <Text style={styles.settingDescription}>
          Nhận thông báo nhắc nhở {reminderMinutes} phút trước mỗi task
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#090E23',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6E7180',
    marginTop: 8,
  },
});