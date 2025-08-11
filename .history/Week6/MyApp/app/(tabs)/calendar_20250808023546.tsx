import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTask, createTask } from "../../sevices/api";
import AddTaskModal from "../../components/AddTaskModal";

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

    const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    const events = [
        {
            date: "Thu",
            day: "12",
            events: [
                {
                    title: "Weekly Meeting",
                    time: "09:00 - 10:00 AM",
                    color: "#FF9797",
                },
                {
                    title: "Help mom to Supermarket",
                    time: "01:00 - 03:00 PM",
                    color: "#9DB1FF",
                },
            ],
        },
        {
            date: "Fri",
            day: "13",
            events: [
                {
                    title: "Building a Gunpla",
                    time: "08:00 - 11:00 AM",
                    color: "#9DB1FF",
                },
                {
                    title: "Upload image to shutterstock",
                    time: "01:00 - 02:00 PM",
                    color: "#FF9797",
                },
            ],
        },
        {
            date: "Sat",
            day: "14",
            events: [
                {
                    title: "Morning Excercise",
                    time: "08:00 - 11:00 AM",
                    color: "#9DB1FF",
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
                                            selectedDate === date &&
                                                isCurrentMonth(date, weekIndex) &&
                                                styles.selectedDateCell,
                                        ]}
                                        onPress={() => setSelectedDate(date)}
                                    >
                                        <Text
                                            style={[
                                                styles.dateText,
                                                !isCurrentMonth(date, weekIndex) &&
                                                    styles.inactiveDateText,
                                                selectedDate === date &&
                                                    isCurrentMonth(date, weekIndex) &&
                                                    styles.selectedDateText,
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
                                        <View
                                            style={[
                                                styles.eventColorBar,
                                                { backgroundColor: event.color },
                                            ]}
                                        />
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
    container: {
        flex: 1,
        backgroundColor: "#FDFDFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    menuButton: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
    },
    menuLine: {
        width: 14,
        height: 2,
        backgroundColor: "#090E23",
    },
    content: {
        flex: 1,
    },
    calendarSection: {
        backgroundColor: "#FBFBFF",
        paddingHorizontal: 0,
        paddingBottom: 24,
    },
    monthNavigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#090E23",
    },
    weekDaysContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#090E23",
        textAlign: "center",
        width: 40,
    },
    calendarGrid: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    dateCell: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    selectedDateCell: {
        backgroundColor: "#A9BAFF",
        position: "relative",
    },
    dateText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#6A6A6A",
    },
    selectedDateText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    inactiveDateText: {
        color: "#C6C6C6",
    },
    eventsSection: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 100,
    },
    dayEventContainer: {
        flexDirection: "row",
        marginBottom: 32,
    },
    dayInfo: {
        width: 47,
        alignItems: "flex-start",
    },
    dayText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#717171",
        marginBottom: 4,
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    eventsContainer: {
        flex: 1,
        marginLeft: 16,
        gap: 12,
    },
    eventCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    eventColorBar: {
        width: 4,
        height: "100%",
    },
    eventContent: {
        flex: 1,
        padding: 12,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#090E23",
        marginBottom: 4,
    },
    eventTime: {
        fontSize: 12,
        fontWeight: "400",
        color: "#717171",
    },
    addButton: {
        position: "absolute",
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        backgroundColor: "#4566EC",
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
