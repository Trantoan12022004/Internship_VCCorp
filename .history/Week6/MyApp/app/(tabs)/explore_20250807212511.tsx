import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(14);

  // Calendar data for January
  const calendarData = [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [30, 31, 1, 2, 3, 4, 5],
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const events = [
    {
      date: 'Thu',
      day: '12',
      events: [
        {
          title: 'Weekly Meeting',
          time: '09:00 - 10:00 AM',
          color: '#FF9797',
        },
        {
          title: 'Help mom to Supermarket',
          time: '01:00 - 03:00 PM',
          color: '#9DB1FF',
        },
      ],
    },
    {
      date: 'Fri',
      day: '13',
      events: [
        {
          title: 'Building a Gunpla',
          time: '08:00 - 11:00 AM',
          color: '#9DB1FF',
        },
        {
          title: 'Upload image to shutterstock',
          time: '01:00 - 02:00 PM',
          color: '#FF9797',
        },
      ],
    },
    {
      date: 'Sat',
      day: '14',
      events: [
        {
          title: 'Morning Excercise',
          time: '08:00 - 11:00 AM',
          color: '#9DB1FF',
        },
      ],
    },
  ];

  const isCurrentMonth = (date: number, weekIndex: number) => {
    if (weekIndex === 0 && date > 15) return false; // Previous month
    if (weekIndex === 5 && date < 15) return false; // Next month
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#090E23" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={16} color="#090E23" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>January</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#090E23" />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((date, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dateCell,
                      selectedDate === date && isCurrentMonth(date, weekIndex) && styles.selectedDateCell,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !isCurrentMonth(date, weekIndex) && styles.inactiveDateText,
                        selectedDate === date && isCurrentMonth(date, weekIndex) && styles.selectedDateText,
                      ]}
                    >
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.eventsSection}>
          {events.map((dayEvent, index) => (
            <View key={index} style={styles.dayEventContainer}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayText}>{dayEvent.date}</Text>
                <Text style={styles.dayNumber}>{dayEvent.day}</Text>
              </View>
              <View style={styles.eventsContainer}>
                {dayEvent.events.map((event, eventIndex) => (
                  <View key={eventIndex} style={styles.eventCard}>
                    <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add New Event Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
