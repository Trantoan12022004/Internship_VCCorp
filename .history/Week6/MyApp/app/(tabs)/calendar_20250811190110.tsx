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
    TextInput,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTask, createTask, loadCalendar } from "../../services/api";
import AddTaskModal from "../../components/AddTaskModal";
import DateTimePicker from "@react-native-community/datetimepicker";

// Interface cho Task
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
    source?: string; // Thêm field source để phân biệt
    googleCalendarId?: string; // Thêm field cho Google Calendar ID
}

export default function CalendarScreen() {
    // ========== STATE MANAGEMENT ==========
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [calendarData, setCalendarData] = useState<number[][]>([]);

    const [showForm, setShowForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // ========== HELPER FUNCTIONS ==========
    // Generate calendar grid
    const generateCalendar = useCallback(() => {
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
    }, [currentDate]);

    // Fetch tasks từ API với caching
    const fetchTasks = useCallback(async () => {
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
    }, []);

    // Load Google Calendar tasks
    const loadTaskCalendar = async () => {
        try {
            // Tạo Promise để đợi người dùng xác nhận thông báo đầu tiên
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

            // Đợi người dùng xác nhận thông báo đầu tiên
            await confirmSync();

            // Thực hiện đồng bộ
            await loadCalendar();
            await fetchTasks();

            // Hiển thị thông báo thành công
            Alert.alert("Thành công", "Đã đồng bộ dữ liệu từ Google Calendar!");
        } catch (error) {
            console.error("Error loading Google Calendar:", error);
            Alert.alert("Lỗi", "Không thể đồng bộ Google Calendar. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // ========== LIFECYCLE HOOKS ==========
    // Auto refresh khi tab được focus
    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    // Generate calendar khi currentDate thay đổi
    useEffect(() => {
        generateCalendar();
    }, [currentDate, generateCalendar]);

    // ========== TASK OPERATIONS ==========
    // Lấy tasks cho ngày được chọn - sử dụng format an toàn để tránh timezone issue
    const getSelectedDateTasks = () => {
        // Tạo date string từ selectedDate mà không bị ảnh hưởng timezone
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const selectedDateString = `${year}-${month}-${day}`;

        console.log("=== FILTERING TASKS FOR SELECTED DATE (CALENDAR) ===");
        console.log("Selected date:", selectedDate.toLocaleDateString("vi-VN"));
        console.log("Selected date string:", selectedDateString);

        const filteredTasks = tasks.filter((task) => {
            // Tạo date string từ task date mà không bị ảnh hưởng timezone
            const taskDateString = task.date.split("T")[0]; // Lấy YYYY-MM-DD

            console.log(
                `Task "${task.title}": ${taskDateString} === ${selectedDateString} => ${
                    taskDateString === selectedDateString
                }`
            );

            return taskDateString === selectedDateString;
        });

        console.log(`Found ${filteredTasks.length} tasks for date ${selectedDateString}`);
        return filteredTasks;
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
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const testDate = new Date(year, month, date);

        return (
            testDate.getDate() === today.getDate() &&
            testDate.getMonth() === today.getMonth() &&
            testDate.getFullYear() === today.getFullYear()
        );
    };

    // Kiểm tra ngày có được chọn không
    const isSelected = (date: number, weekIndex: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const testDate = new Date(year, month, date);

        // So sánh theo ngày, tháng, năm thay vì toDateString
        return (
            testDate.getDate() === selectedDate.getDate() &&
            testDate.getMonth() === selectedDate.getMonth() &&
            testDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    // Xử lý chọn ngày
    const handleDateSelect = (date: number, weekIndex: number) => {
        // Tạo date object chính xác không bị lệch timezone
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Tạo date ở local timezone
        const newSelectedDate = new Date(year, month, date);

        console.log("=== DATE SELECTED (CALENDAR) ===");
        console.log("Selected date:", newSelectedDate.toLocaleDateString("vi-VN"));
        console.log("Date components:", {
            date: date,
            year: year,
            month: month + 1, // +1 để hiển thị tháng thực
            day: newSelectedDate.getDate(),
        });

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

    const handleAddTask = async () => {
        if (!taskTitle.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề task");
            return;
        }

        // Kết hợp date và time
        const taskDateTime = new Date(selectedDate);
        taskDateTime.setHours(selectedTime.getHours());
        taskDateTime.setMinutes(selectedTime.getMinutes());

        // Kiểm tra thời gian có trong tương lai không
        if (taskDateTime <= new Date()) {
            Alert.alert("Lỗi", "Thời gian task phải trong tương lai");
            return;
        }

        await createTask({
            title: taskTitle,
            description: taskDescription,
            date: taskDateTime.toISOString(),
            time: taskDateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        });

        // Reset form
        setTaskTitle("");
        setTaskDescription("");
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setShowForm(false);

        Alert.alert(
            "Thành công",
            `Task đã được tạo! Bạn sẽ nhận thông báo lúc ${taskDateTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })} (15 phút trước task)`
        );
    };

    const handleDeleteTask = (taskId: string, taskTitle: string) => {
        Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa task "${taskTitle}"?`, [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: () => deleteTask(taskId),
            },
        ]);
    };

    const formatDateTime = (date: Date) => {
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getNotificationTime = (taskTime: Date) => {
        const notificationTime = new Date(taskTime);
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        return notificationTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color="#090E23" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Calendar</Text>
                <TouchableOpacity style={styles.menuButton} onPress={fetchTasks}>
                    <Ionicons name="refresh" size={20} color="#090E23" />
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
                                            backgroundColor:
                                                task.source === "google-calendar"
                                                    ? "#FF6B35"
                                                    : task.is_completed
                                                    ? "#4CAF50"
                                                    : "#4566EC",
                                        },
                                    ]}
                                />
                                <View style={styles.eventContent}>
                                    <View style={styles.taskHeader}>
                                        <Text
                                            style={[
                                                styles.eventTitle,
                                                task.is_completed && styles.completedTaskTitle,
                                            ]}
                                        >
                                            {task.title}
                                        </Text>
                                        {task.source === "google-calendar" && (
                                            <Ionicons
                                                name="logo-google"
                                                size={12}
                                                color="#FF6B35"
                                                style={styles.googleIcon}
                                            />
                                        )}
                                    </View>
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

                {/* Add Task Form */}
                {showForm && (
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Tạo Task Mới</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Tiêu đề task"
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                        />

                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Mô tả (tùy chọn)"
                            value={taskDescription}
                            onChangeText={setTaskDescription}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Time Picker */}
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text>
                                🕐 Giờ:{" "}
                                {selectedTime.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </TouchableOpacity>

                        {/* Notification Info */}
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationInfoText}>
                                🔔 Thông báo sẽ được gửi lúc:{" "}
                                {getNotificationTime(
                                    (() => {
                                        const combined = new Date(selectedDate);
                                        combined.setHours(selectedTime.getHours());
                                        combined.setMinutes(selectedTime.getMinutes());
                                        return combined;
                                    })()
                                )}
                            </Text>
                        </View>

                        <View style={styles.formButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setShowForm(false)}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleAddTask}
                            >
                                <Text style={styles.saveButtonText}>Lưu Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Add New Task Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>

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

            {/* Time Picker */}
            {showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, time) => {
                        setShowTimePicker(false);
                        if (time) setSelectedTime(time);
                    }}
                />
            )}
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
    taskHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    googleIcon: {
        marginLeft: 8,
    },
    form: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: "top",
    },
    dateTimeButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#f8f9fa",
    },
    notificationInfo: {
        backgroundColor: "#e3f2fd",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    notificationInfoText: {
        color: "#1976d2",
        fontSize: 14,
        textAlign: "center",
    },
    formButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    saveButton: {
        backgroundColor: "#28a745",
    },
    cancelButtonText: {
        color: "#666",
        fontWeight: "bold",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});
