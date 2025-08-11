import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTask, createTask } from "../../sevices/api";
import AddTaskModal from "../../components/AddTaskModal";

// Interface cho Task
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
}

export default function CalendarScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [calendarData, setCalendarData] = useState<number[][]>([]);

    // Load tasks khi component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const response = await getTask();
                if (response.data && response.data.data) {
                    setTasks(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách tasks");
            } finally {
                setLoading(false);
            }
        };

        const generateCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Ngày đầu tiên của tháng
            const firstDay = new Date(year, month, 1);

            // Ngày đầu tiên hiển thị trên calendar (có thể là tháng trước)
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Bắt đầu từ thứ 2

            const calendar = [];
            let currentWeek = [];

            for (let i = 0; i < 42; i++) {
                // 6 tuần x 7 ngày
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);

                currentWeek.push(date.getDate());

                if (currentWeek.length === 7) {
                    calendar.push([...currentWeek]);
                    currentWeek = [];
                }
            }

            setCalendarData(calendar);
        };

        fetchTasks();
        generateCalendar();
    }, [currentDate]);

    // Lấy tasks cho ngày được chọn
    const getSelectedDateTasks = () => {
        const selectedDateString = selectedDate.toISOString().split("T")[0];
        return tasks.filter((task) => {
            const taskDate = new Date(task.date).toISOString().split("T")[0];
            return taskDate === selectedDateString;
        });
    };

    // Xử lý tạo task mới
    const handleCreateTask = async (taskData: Omit<Task, "_id" | "is_completed">) => {
        try {
            const response = await createTask(taskData);

            if (response.data.success) {
                const newTask = response.data.data;
                setTasks((prevTasks) => [...prevTasks, newTask]);
                Alert.alert("Thành công", "Task đã được tạo thành công!");
                setIsModalVisible(false);
            } else {
                throw new Error(response.data.message || "Không thể tạo task");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            throw error;
        }
    };

    // Kiểm tra ngày có phải tháng hiện tại không
    const isCurrentMonth = (date: number, weekIndex: number) => {
        const currentMonth = currentDate.getMonth();
        const testDate = new Date(currentDate.getFullYear(), currentMonth, date);
        return testDate.getMonth() === currentMonth;
    };

    // Kiểm tra ngày có phải hôm nay không
    const isToday = (date: number, weekIndex: number) => {
        const today = new Date();
        const testDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
        return testDate.toDateString() === today.toDateString();
    };

    // Kiểm tra ngày có được chọn không
    const isSelected = (date: number, weekIndex: number) => {
        const testDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
        return testDate.toDateString() === selectedDate.toDateString();
    };

    // Xử lý chọn ngày
    const handleDateSelect = (date: number, weekIndex: number) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
        setSelectedDate(newSelectedDate);
    };

    // Chuyển tháng
    const changeMonth = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        if (direction === "prev") {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const selectedDateTasks = getSelectedDateTasks();
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ];

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
                        <TouchableOpacity onPress={() => changeMonth("prev")}>
                            <Ionicons name="chevron-back" size={16} color="#090E23" />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth("next")}>
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
                                            isSelected(date, weekIndex) && styles.selectedDateCell,
                                            isToday(date, weekIndex) && styles.todayDateCell,
                                        ]}
                                        onPress={() => handleDateSelect(date, weekIndex)}
                                    >
                                        <Text
                                            style={[
                                                styles.dateText,
                                                !isCurrentMonth(date, weekIndex) &&
                                                    styles.inactiveDateText,
                                                isSelected(date, weekIndex) &&
                                                    styles.selectedDateText,
                                                isToday(date, weekIndex) && styles.todayDateText,
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

                {/* Tasks Section */}
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>
                        Tasks cho {selectedDate.toLocaleDateString("vi-VN")}
                    </Text>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4566EC" />
                            <Text style={styles.loadingText}>Đang tải tasks...</Text>
                        </View>
                    ) : selectedDateTasks.length > 0 ? (
                        selectedDateTasks.map((task) => (
                            <View key={task._id} style={styles.eventCard}>
                                <View
                                    style={[
                                        styles.eventColorBar,
                                        {
                                            backgroundColor: task.is_completed
                                                ? "#4CAF50"
                                                : "#4566EC",
                                        },
                                    ]}
                                />
                                <View style={styles.eventContent}>
                                    <Text
                                        style={[
                                            styles.eventTitle,
                                            task.is_completed && styles.completedTaskTitle,
                                        ]}
                                    >
                                        {task.title}
                                    </Text>
                                    <Text style={styles.eventTime}>{task.time}</Text>
                                    {task.description && (
                                        <Text style={styles.eventDescription}>
                                            {task.description}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.taskStatus}>
                                    <Ionicons
                                        name={
                                            task.is_completed ? "checkmark-circle" : "time-outline"
                                        }
                                        size={20}
                                        color={task.is_completed ? "#4CAF50" : "#FFA726"}
                                    />
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noTasksContainer}>
                            <Ionicons name="calendar-outline" size={48} color="#C6C6C6" />
                            <Text style={styles.noTasksText}>Không có task nào cho ngày này</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add New Task Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <AddTaskModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onCreateTask={handleCreateTask}
                selectedDate={selectedDate}
            />
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
    todayDateCell: {
        backgroundColor: "#FFA726",
    },
    todayDateText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#090E23",
        marginBottom: 16,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#717171",
    },
    completedTaskTitle: {
        textDecorationLine: "line-through",
        color: "#717171",
    },
    eventDescription: {
        fontSize: 12,
        color: "#717171",
        marginTop: 4,
    },
    taskStatus: {
        paddingHorizontal: 12,
        justifyContent: "center",
    },
    noTasksContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    noTasksText: {
        fontSize: 14,
        color: "#717171",
        marginTop: 12,
        textAlign: "center",
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
