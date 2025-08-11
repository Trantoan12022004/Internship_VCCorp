import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {getTask} from "../../sevices/api"; // Assuming you have a service to fetch tasks
export default function HomeScreen() {

  // State để quản lý dữ liệu
  const
    const calendarDays = [
        { day: "Sun", date: "09" },
        { day: "Mon", date: "10" },
        { day: "Tue", date: "11" },
        { day: "Wed", date: "12", isActive: true },
        { day: "Thu", date: "13" },
        { day: "Fri", date: "14" },
        { day: "Sat", date: "15" },
    ];

    const tasks = [
        { id: 1, title: "Finishing Wireframe", completed: false },
        { id: 2, title: "Meeting with team", completed: false },
        { id: 3, title: "Buy a cat food", completed: false },
        { id: 4, title: "Finishing daily commission", completed: true },
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
                                style={[
                                    styles.calendarDay,
                                    item.isActive && styles.calendarDayActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.calendarDayText,
                                        item.isActive && styles.calendarDayTextActive,
                                    ]}
                                >
                                    {item.day}
                                </Text>
                                <Text
                                    style={[
                                        styles.calendarDateText,
                                        item.isActive && styles.calendarDateTextActive,
                                    ]}
                                >
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
                        <View style={[styles.reminderIcon, { backgroundColor: "#99ADFF" }]}>
                            <Ionicons name="checkmark" size={16} color="#1C3082" />
                        </View>
                        <View style={styles.reminderContent}>
                            <Text style={styles.reminderTitle}>Task Complete</Text>
                            <Text style={styles.reminderNumber}>50</Text>
                            <Text style={styles.reminderSubtitle}>This Week</Text>
                        </View>
                    </View>

                    <View style={[styles.reminderCard, { backgroundColor: "#FFE6E7" }]}>
                        <View style={[styles.reminderIcon, { backgroundColor: "#FFB1B5" }]}>
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
                                <Text
                                    style={[
                                        styles.taskTitle,
                                        task.completed && styles.taskTitleCompleted,
                                    ]}
                                >
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
    headerIcon: {
        width: 24,
        height: 24,
        position: "relative",
    },
    notificationDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        backgroundColor: "#FF6B6B",
        borderRadius: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 18,
    },
    calendar: {
        marginBottom: 32,
    },
    calendarDay: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        minWidth: 50,
    },
    calendarDayActive: {
        backgroundColor: "#4566EC",
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#C0C0C0",
        marginBottom: 4,
    },
    calendarDayTextActive: {
        color: "#FFFFFF",
    },
    calendarDateText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#C0C0C0",
    },
    calendarDateTextActive: {
        color: "#FFFFFF",
    },
    calendarDot: {
        width: 4,
        height: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: 2,
        marginTop: 4,
    },
    reminderSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
        gap: 16,
    },
    reminderCard: {
        flex: 1,
        backgroundColor: "#EFF2FF",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    reminderIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    reminderContent: {
        flex: 1,
    },
    reminderTitle: {
        fontSize: 12,
        fontWeight: "400",
        color: "#090E23",
        marginBottom: 4,
    },
    reminderNumber: {
        fontSize: 22,
        fontWeight: "600",
        color: "#090E23",
        marginBottom: 2,
    },
    reminderSubtitle: {
        fontSize: 10,
        fontWeight: "400",
        color: "#6E7180",
    },
    tasksSection: {
        marginBottom: 100,
    },
    tasksSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    tasksSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4566EC",
    },
    tasksList: {
        gap: 16,
    },
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
    },
    taskCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#4566EC",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    taskCheckboxEmpty: {
        width: 12,
        height: 12,
        backgroundColor: "transparent",
    },
    taskTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#090E23",
    },
    taskTitleCompleted: {
        textDecorationLine: "line-through",
        color: "#6E7180",
    },
    taskMenu: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    taskMenuDot: {
        width: 3,
        height: 3,
        backgroundColor: "#C0C0C0",
        borderRadius: 1.5,
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
