import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const calendarDays = [
    { day: 'Sun', date: '09' },
    { day: 'Mon', date: '10' },
    { day: 'Tue', date: '11' },
    { day: 'Wed', date: '12', isActive: true },
    { day: 'Thu', date: '13' },
    { day: 'Fri', date: '14' },
    { day: 'Sat', date: '15' },
  ];

  const tasks = [
    { id: 1, title: 'Finishing Wireframe', completed: false },
    { id: 2, title: 'Meeting with team', completed: false },
    { id: 3, title: 'Buy a cat food', completed: false },
    { id: 4, title: 'Finishing daily commission', completed: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color="#090E23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="search-outline" size={24} color="#090E23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#090E23" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {calendarDays.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.calendarDay, item.isActive && styles.calendarDayActive]}
              >
                <Text style={[styles.calendarDayText, item.isActive && styles.calendarDayTextActive]}>
                  {item.day}
                </Text>
                <Text style={[styles.calendarDateText, item.isActive && styles.calendarDateTextActive]}>
                  {item.date}
                </Text>
                {item.isActive && <View style={styles.calendarDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reminder Cards */}
        <View style={styles.reminderSection}>
          <View style={styles.reminderCard}>
            <View style={[styles.reminderIcon, { backgroundColor: '#99ADFF' }]}>
              <Ionicons name="checkmark" size={16} color="#1C3082" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Task Complete</Text>
              <Text style={styles.reminderNumber}>50</Text>
              <Text style={styles.reminderSubtitle}>This Week</Text>
            </View>
          </View>

          <View style={styles.reminderCard}>
            <View style={[styles.reminderIcon, { backgroundColor: '#FFB1B5' }]}>
              <Ionicons name="time-outline" size={16} color="#B2282D" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Task Pending</Text>
              <Text style={styles.reminderNumber}>08</Text>
              <Text style={styles.reminderSubtitle}>This Week</Text>
            </View>
          </View>
        </View>

        {/* Tasks Today */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.tasksSectionTitle}>Tasks Today</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity style={styles.taskCheckbox}>
                  {task.completed ? (
                    <Ionicons name="checkmark" size={14} color="#4566EC" />
                  ) : (
                    <View style={styles.taskCheckboxEmpty} />
                  )}
                </TouchableOpacity>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                  {task.title}
                </Text>
                <View style={styles.taskMenu}>
                  <View style={styles.taskMenuDot} />
                  <View style={styles.taskMenuDot} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add New Task Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
