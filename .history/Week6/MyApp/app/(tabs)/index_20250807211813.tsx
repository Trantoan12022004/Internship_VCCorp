import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(12);

  const calendarDays = [
    { day: 'Sun', date: 9 },
    { day: 'Mon', date: 10 },
    { day: 'Tue', date: 11 },
    { day: 'Wed', date: 12 },
    { day: 'Thu', date: 13 },
    { day: 'Fri', date: 14 },
    { day: 'Sat', date: 15 },
  ];

  const tasks = [
    { id: 1, title: 'Finishing Wireframe', completed: false },
    { id: 2, title: 'Meeting with team', completed: false },
    { id: 3, title: 'Buy a cat food', completed: false },
    { id: 4, title: 'Finishing daily commission', completed: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={20} color="#090E23" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={20} color="#090E23" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#090E23" />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {calendarDays.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                selectedDate === item.date && styles.selectedCalendarDay
              ]}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text style={[
                styles.dayText,
                selectedDate === item.date && styles.selectedDayText
              ]}>
                {item.day}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDate === item.date && styles.selectedDateText
              ]}>
                {item.date}
              </Text>
              {selectedDate === item.date && <View style={styles.selectedDot} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder Cards */}
        <View style={styles.reminderContainer}>
          <View style={styles.taskCompleteCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="checkmark" size={16} color="#1C3082" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Task Complete</Text>
              <Text style={styles.cardNumber}>50</Text>
              <Text style={styles.cardSubtitle}>This Week</Text>
            </View>
          </View>

          <View style={styles.taskPendingCard}>
            <View style={styles.cardIconPending}>
              <Ionicons name="megaphone-outline" size={16} color="#B2282D" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Task Pending</Text>
              <Text style={styles.cardNumber}>08</Text>
              <Text style={styles.cardSubtitle}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Tasks Today */}
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Tasks Today</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {tasks.map((task, index) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity style={styles.checkbox}>
                  {task.completed && (
                    <Ionicons name="checkmark" size={12} color="#4566EC" />
                  )}
                </TouchableOpacity>
                <Text style={[
                  styles.taskText,
                  task.completed && styles.completedTaskText
                ]}>
                  {task.title}
                </Text>
                <View style={styles.taskOptions}>
                  <View style={styles.optionDot} />
                  <View style={styles.optionDot} />
                </View>
                {index < tasks.length - 1 && <View style={styles.taskDivider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
