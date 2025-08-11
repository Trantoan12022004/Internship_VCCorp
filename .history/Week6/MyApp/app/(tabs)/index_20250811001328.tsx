import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { getTask, updateTask, createTask, deleteTask, loadCalendar } from "../../sevices/api";
import AddTaskModal from "../../components/AddTaskModal";
import NotificationService from "../../services/notificationService";

// Interface để khớp với dữ liệu từ API
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
}

interface CalendarDay {
    day: string;
    date: string;
    fullDate: Date;
    isActive: boolean;
}

export default function HomeScreen() {
    // ========== STATE MANAGEMENT ==========
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [taskStats, setTaskStats] = useState({
        completed: 0,
        pending: 0,
    });

    // ========== LIFECYCLE HOOKS ==========
    // Initialize notifications when component mounts
    useEffect(() => {
        // Request notification permissions
        NotificationService.checkPermissions((permissions) => {
            console.log("Notification permissions:", permissions);
            if (!permissions.alert) {
                NotificationService.requestPermissions();
            }
        });

        generateCalendarDays();
    }, [generateCalendarDays]);

    // Auto refresh khi tab được focus
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    // ========== HELPER FUNCTIONS ==========
    // Fetch tasks từ API - Updated with notification scheduling
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            console.log("Fetching tasks from API...");

            const response = await getTask();

            if (response.data.success) {
                const allTasks = response.data.data;
                setTasks(allTasks);
                calculateStats(allTasks);

                // Schedule notifications for all upcoming tasks
                NotificationService.scheduleMultipleTaskReminders(allTasks);

                console.log("Tasks loaded successfully:", allTasks.length);
            } else {
                Alert.alert("Lỗi", "Không thể lấy dữ liệu tasks");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
        } finally {
            setLoading(false);
        }
    }, [calculateStats]);

    // Load Google Calendar tasks - Updated with notification scheduling
    const loadTaskCalendar = async () => {
        try {
            const confirmSync = () => {
                return new Promise<void>((resolve) => {
                    Alert.alert("Đang đồng bộ", "Đang tải dữ liệu từ Google Calendar...", [
                        {
                            text: "OK",
                            onPress: () => resolve(),
                        },
                    ]);
                });
            };

            setLoading(true);
            await confirmSync();
            await loadCalendar();
            await fetchTasks(); // This will also schedule notifications

            Alert.alert("Thành công", "Đã đồng bộ dữ liệu từ Google Calendar!");
        } catch (error) {
            console.error("Error loading Google Calendar:", error);
            Alert.alert("Lỗi", "Không thể đồng bộ Google Calendar. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle task completion - Updated with notification management
    const toggleTaskCompletion = async (taskId: string) => {
        const currentTask = tasks.find((task) => task._id === taskId);
        if (!currentTask) {
            console.log("Task not found:", taskId);
            return;
        }

        const newCompletionStatus = !currentTask.is_completed;
        const previousTasks = [...tasks];
        const previousStats = { ...taskStats };

        try {
            const updatedTasks = tasks.map((task) =>
                task._id === taskId ? { ...task, is_completed: newCompletionStatus } : task
            );
            setTasks(updatedTasks);
            calculateStats(updatedTasks);

            // Cancel notification if task is completed
            if (newCompletionStatus) {
                NotificationService.cancelTaskReminder(taskId);
            } else {
                // Reschedule notification if task is uncompleted
                const updatedTask = updatedTasks.find((task) => task._id === taskId);
                if (updatedTask) {
                    NotificationService.scheduleTaskReminder(updatedTask);
                }
            }

            const response = await updateTask(taskId, {
                is_completed: newCompletionStatus,
            });

            if (response.data && response.data.success) {
                const serverUpdatedTask = response.data.data;
                const finalUpdatedTasks = tasks.map((task) =>
                    task._id === taskId ? serverUpdatedTask : task
                );
                setTasks(finalUpdatedTasks);
                calculateStats(finalUpdatedTasks);
            } else {
                throw new Error(response.data?.message || "API returned unsuccessful response");
            }
        } catch (error) {
            console.error("Error updating task:", error);
            setTasks(previousTasks);
            setTaskStats(previousStats);

            // Revert notification state
            if (newCompletionStatus) {
                const originalTask = previousTasks.find((task) => task._id === taskId);
                if (originalTask && !originalTask.is_completed) {
                    NotificationService.scheduleTaskReminder(originalTask);
                }
            } else {
                NotificationService.cancelTaskReminder(taskId);
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa task này?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        console.log("Deleting task:", taskId);

                        const response = await deleteTask(taskId);

                        if (response.data.success) {
                            // Cancel notification for deleted task
                            NotificationService.cancelTaskReminder(taskId);

                            const updatedTasks = tasks.filter((task) => task._id !== taskId);
                            setTasks(updatedTasks);
                            calculateStats(updatedTasks);

                            Alert.alert("Thành công", "Task đã được xóa!");
                            console.log("Task deleted successfully:", taskId);
                        } else {
                            throw new Error(response.data.message || "Không thể xóa task");
                        }
                    } catch (error) {
                        console.error("Error deleting task:", error);
                        Alert.alert("Lỗi", "Không thể xóa task. Vui lòng thử lại.");
                    }
                },
            },
        ]);
    };

    // Format time để hiển thị
    const formatTime = (time: string): string => {
        return time || "No time";
    };

    // Format date để hiển thị - sử dụng local date components
    const formatDate = (date: Date | string): string => {
        if (typeof date === "string") {
            // Với string từ API (YYYY-MM-DDTHH:mm:ss.sssZ), parse an toàn
            const dateOnly = date.split("T")[0]; // Lấy YYYY-MM-DD
            const [year, month, day] = dateOnly.split("-").map(Number);

            // Tạo Date object với local timezone (tháng cần trừ 1 vì 0-based)
            const targetDate = new Date(year, month - 1, day);

            return targetDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        } else {
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    };

    // Lấy tasks cho ngày được chọn
    const selectedDateTasks = getTasksForSelectedDate();

    // Handle create new task
    const handleCreateTask = async (taskData: Omit<Task, "_id" | "is_completed">) => {
        try {
            // Gọi API tạo task mới
            const response = await createTask(taskData);

            if (response.data.success) {
                // Thêm task mới vào state
                const newTask = response.data.data;
                const updatedTasks = [...tasks, newTask];
                setTasks(updatedTasks);
                calculateStats(updatedTasks);

                // Schedule notification for new task
                NotificationService.scheduleTaskReminder(newTask);

                Alert.alert("Thành công", "Task đã được tạo thành công!");
                setIsModalVisible(false); // Đóng modal sau khi tạo thành công
            } else {
                throw new Error(response.data.message || "Không thể tạo task");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            throw error; // Re-throw để modal xử lý
        }
    };

    // Hiển thị loading screen
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#4566EC" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </SafeAreaView>
        );
    }

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
                <TouchableOpacity
                    style={styles.headerIcon}
                    onPress={() => NotificationService.showTestNotification()}
                >
                    <Ionicons name="notifications-outline" size={24} color="#090E23" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon} onPress={fetchTasks}>
                    <Ionicons name="refresh-outline" size={24} color="#090E23" />
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
                                onPress={() => handleDateSelect(item)}
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
                            <Text style={styles.reminderNumber}>{taskStats.completed}</Text>
                            <Text style={styles.reminderSubtitle}>This Week</Text>
                        </View>
                    </View>

                    <View style={[styles.reminderCard, { backgroundColor: "#FFE6E7" }]}>
                        <View style={[styles.reminderIcon, { backgroundColor: "#FFB1B5" }]}>
                            <Ionicons name="time-outline" size={16} color="#B2282D" />
                        </View>
                        <View style={styles.reminderContent}>
                            <Text style={styles.reminderTitle}>Task Pending</Text>
                            <Text style={styles.reminderNumber}>{taskStats.pending}</Text>
                            <Text style={styles.reminderSubtitle}>This Week</Text>
                        </View>
                    </View>
                </View>

                {/* Tasks for Selected Date */}
                <View style={styles.tasksSection}>
                    <View style={styles.tasksSectionHeader}>
                        <Text style={styles.tasksSectionTitle}>
                            Tasks for {formatDate(selectedDate)}
                        </Text>
                        <TouchableOpacity onPress={fetchTasks}>
                            <Text style={styles.viewAllText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tasksList}>
                        {selectedDateTasks.length > 0 ? (
                            selectedDateTasks.map((task) => (
                                <View key={task._id} style={styles.taskItem}>
                                    <TouchableOpacity
                                        style={[
                                            styles.taskCheckbox,
                                            task.is_completed && styles.taskCheckboxCompleted,
                                        ]}
                                        onPress={() => toggleTaskCompletion(task._id)}
                                        activeOpacity={0.7}
                                    >
                                        {task.is_completed ? (
                                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                        ) : (
                                            <View style={styles.taskCheckboxEmpty} />
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.taskContent}>
                                        <Text
                                            style={[
                                                styles.taskTitle,
                                                task.is_completed && styles.taskTitleCompleted,
                                            ]}
                                        >
                                            {task.title}
                                        </Text>
                                        {task.description && (
                                            <Text
                                                style={[
                                                    styles.taskDescription,
                                                    task.is_completed &&
                                                        styles.taskDescriptionCompleted,
                                                ]}
                                            >
                                                {task.description}
                                            </Text>
                                        )}
                                        <Text style={styles.taskTime}>{formatTime(task.time)}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.taskMenu}
                                        activeOpacity={0.7}
                                        onPress={() => handleDeleteTask(task._id)}
                                    >
                                        <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noTasksContainer}>
                                <Ionicons name="calendar-outline" size={48} color="#C0C0C0" />
                                <Text style={styles.noTasksText}>
                                    Không có task nào cho ngày {formatDate(selectedDate)}
                                </Text>
                                <TouchableOpacity
                                    style={styles.addTaskButton}
                                    onPress={fetchTasks}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.addTaskButtonText}>Tải lại</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Add New Task Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {/* Add New Task Button */}
            <TouchableOpacity style={styles.loadCalendar} onPress={() => loadTaskCalendar()}>
                <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
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
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6E7180",
        fontWeight: "500",
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
        alignItems: "flex-start",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        marginTop: 2,
    },
    taskCheckboxCompleted: {
        backgroundColor: "#4566EC",
        borderColor: "#4566EC",
    },
    taskCheckboxEmpty: {
        width: 12,
        height: 12,
        backgroundColor: "transparent",
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#090E23",
        marginBottom: 4,
        lineHeight: 20,
    },
    taskTitleCompleted: {
        textDecorationLine: "line-through",
        color: "#6E7180",
        opacity: 0.7,
    },
    taskDescription: {
        fontSize: 13,
        color: "#6E7180",
        marginBottom: 6,
        lineHeight: 18,
    },
    taskDescriptionCompleted: {
        textDecorationLine: "line-through",
        color: "#6E7180",
        opacity: 0.6,
    },
    taskTime: {
        fontSize: 12,
        color: "#4566EC",
        fontWeight: "500",
    },
    taskMenu: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingLeft: 8,
    },
    taskMenuDot: {
        width: 3,
        height: 3,
        backgroundColor: "#C0C0C0",
        borderRadius: 1.5,
    },
    noTasksContainer: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    noTasksText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6E7180",
        textAlign: "center",
        lineHeight: 20,
    },
    addTaskButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#4566EC",
        borderRadius: 8,
    },
    addTaskButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
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
    loadCalendar: {
        position: "absolute",
        bottom: 100,
        right: 88, // 24 (right margin) + 56 (button width) + 8 (gap) = 88
        width: 56,
        height: 56,
        backgroundColor: "#22C55E", // Màu xanh lá khác biệt với nút add
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
