// Import các thư viện React cần thiết cho component
import React, { useState, useEffect } from "react";
// Import các component UI từ React Native
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
// Import icon từ Expo
import { Ionicons } from "@expo/vector-icons";
// Import API service để lấy dữ liệu tasks
import { getTask } from "../../sevices/api";

// Component chính cho màn hình Home
export default function HomeScreen() {
    // State để lưu ngày được chọn trong calendar (mặc định là ngày hiện tại)
    const [selectedDate, setSelectedDate] = useState(new Date());
    // State để lưu danh sách các ngày hiển thị trong calendar horizontal
    const [calendarDays, setCalendarDays] = useState([]);
    // State để lưu danh sách tất cả tasks từ API
    const [tasks, setTasks] = useState([]);
    // State để quản lý trạng thái loading khi fetch dữ liệu
    const [loading, setLoading] = useState(true);
    // State để lưu thống kê số lượng task completed và pending
    const [taskStats, setTaskStats] = useState({
        completed: 0,
        pending: 0,
    });

    // Effect hook để tạo calendar days khi component mount
    useEffect(() => {
        const generateCalendarDays = () => {
            const today = new Date();
            const days = [];

            // Tạo 7 ngày từ 3 ngày trước đến 3 ngày sau ngày hiện tại
            for (let i = -3; i <= 3; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Mảng tên các ngày trong tuần
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

                // Tạo object cho mỗi ngày với thông tin cần thiết
                days.push({
                    day: dayNames[date.getDay()], // Tên ngày (Sun, Mon, ...)
                    date: date.getDate().toString().padStart(2, "0"), // Số ngày (01, 02, ...)
                    fullDate: new Date(date), // Object Date đầy đủ
                    isActive: i === 0, // Ngày hiện tại được đánh dấu là active
                });
            }

            // Cập nhật state với danh sách ngày đã tạo
            setCalendarDays(days);
        };

        generateCalendarDays();
    }, []); // Dependency array rỗng = chỉ chạy 1 lần khi component mount

    // Effect hook để fetch tasks từ API khi component mount
    useEffect(() => {
        fetchTasks();
    }, []);

    // Hàm async để gọi API lấy danh sách tasks
    const fetchTasks = async () => {
        try {
            setLoading(true); // Bắt đầu loading
            const response = await getTask(); // Gọi API

            // Kiểm tra response thành công
            if (response.data.success) {
                const allTasks = response.data.data;
                setTasks(allTasks); // Lưu tasks vào state

                // TODO: Tính toán thống kê completed/pending tasks
            } else {
                // Hiển thị thông báo lỗi nếu API trả về thất bại
                Alert.alert("Lỗi", "Không thể lấy dữ liệu tasks");
            }
        } catch (error) {
            // Xử lý lỗi kết nối hoặc lỗi khác
            console.error("Error fetching tasks:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến server");
        } finally {
            setLoading(false); // Kết thúc loading dù thành công hay thất bại
        }
    };

    // Hàm filter để lấy các tasks của ngày được chọn
    const getTasksForSelectedDate = () => {
        // Chuyển đổi ngày được chọn thành string format YYYY-MM-DD
        const selectedDateString = selectedDate.toISOString().split("T")[0];

        // Filter tasks có cùng ngày với ngày được chọn
        return tasks.filter((task) => {
            const taskDate = new Date(task.date).toISOString().split("T")[0];
            return taskDate === selectedDateString;
        });
    };

    // Hàm xử lý khi user chọn một ngày trong calendar
    const handleDateSelect = (selectedDay) => {
        // Cập nhật trạng thái active cho ngày được chọn
        const updatedDays = calendarDays.map((day) => ({
            ...day,
            isActive: day.fullDate.getTime() === selectedDay.fullDate.getTime(),
        }));

        // Cập nhật state calendar days và selected date
        setCalendarDays(updatedDays);
        setSelectedDate(selectedDay.fullDate);
    };

    // Hàm toggle trạng thái hoàn thành của task
    const toggleTaskCompletion = async (taskId) => {
        // TODO: Implement API call để cập nhật trạng thái task trên server
        // Hiện tại chỉ cập nhật local state
        const updatedTasks = tasks.map((task) =>
            task._id === taskId
                ? { ...task, is_completed: !task.is_completed } // Đảo ngược trạng thái
                : task
        );
        setTasks(updatedTasks);
        calculateStats(updatedTasks); // Cập nhật lại thống kê
    };

    // Hàm format thời gian để hiển thị
    const formatTime = (time) => {
        return time || "No time"; // Trả về "No time" nếu không có thời gian
    };

    // Hàm format ngày để hiển thị
    const formatDate = (date) => {
        const taskDate = new Date(date);
        return taskDate.toLocaleDateString("en-US", {
            month: "short", // Tên tháng viết tắt (Jan, Feb, ...)
            day: "numeric", // Số ngày
        });
    };

    // Lấy danh sách tasks cho ngày được chọn
    const selectedDateTasks = getTasksForSelectedDate();

    // Hiển thị loading screen khi đang fetch dữ liệu
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
            {/* Header với các icon settings, search, notifications */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="settings-outline" size={24} color="#090E23" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="search-outline" size={24} color="#090E23" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="notifications-outline" size={24} color="#090E23" />
                    {/* Notification dot indicator */}
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            {/* Nội dung chính có thể scroll */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Calendar horizontal với 7 ngày */}
                <View style={styles.calendar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {calendarDays.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.calendarDay,
                                    item.isActive && styles.calendarDayActive, // Style khác cho ngày active
                                ]}
                                onPress={() => handleDateSelect(item)}
                            >
                                {/* Tên ngày (Sun, Mon, ...) */}
                                <Text
                                    style={[
                                        styles.calendarDayText,
                                        item.isActive && styles.calendarDayTextActive,
                                    ]}
                                >
                                    {item.day}
                                </Text>
                                {/* Số ngày (01, 02, ...) */}
                                <Text
                                    style={[
                                        styles.calendarDateText,
                                        item.isActive && styles.calendarDateTextActive,
                                    ]}
                                >
                                    {item.date}
                                </Text>
                                {/* Dot indicator cho ngày active */}
                                {item.isActive && <View style={styles.calendarDot} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Section hiển thị thống kê tasks */}
                <View style={styles.reminderSection}>
                    {/* Card hiển thị số task completed */}
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

                    {/* Card hiển thị số task pending */}
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

                {/* Section hiển thị danh sách tasks cho ngày được chọn */}
                <View style={styles.tasksSection}>
                    {/* Header của tasks section */}
                    <View style={styles.tasksSectionHeader}>
                        <Text style={styles.tasksSectionTitle}>
                            Tasks for {formatDate(selectedDate)}
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Danh sách tasks */}
                    <View style={styles.tasksList}>
                        {selectedDateTasks.length > 0 ? (
                            // Hiển thị danh sách tasks nếu có
                            selectedDateTasks.map((task) => (
                                <View key={task._id} style={styles.taskItem}>
                                    {/* Checkbox để toggle trạng thái task */}
                                    <TouchableOpacity
                                        style={[
                                            styles.taskCheckbox,
                                            task.is_completed && styles.taskCheckboxCompleted,
                                        ]}
                                        onPress={() => toggleTaskCompletion(task._id)}
                                    >
                                        {task.is_completed ? (
                                            <Ionicons name="checkmark" size={14} color="#4566EC" />
                                        ) : (
                                            <View style={styles.taskCheckboxEmpty} />
                                        )}
                                    </TouchableOpacity>
                                    {/* Nội dung task */}
                                    <View style={styles.taskContent}>
                                        {/* Tiêu đề task */}
                                        <Text
                                            style={[
                                                styles.taskTitle,
                                                task.is_completed && styles.taskTitleCompleted, // Style gạch ngang nếu completed
                                            ]}
                                        >
                                            {task.title}
                                        </Text>
                                        {/* Mô tả task (nếu có) */}
                                        {task.description && (
                                            <Text style={styles.taskDescription}>
                                                {task.description}
                                            </Text>
                                        )}
                                        {/* Thời gian task */}
                                        <Text style={styles.taskTime}>{formatTime(task.time)}</Text>
                                    </View>
                                    {/* Menu 3 dots cho các action khác */}
                                    <TouchableOpacity style={styles.taskMenu}>
                                        <View style={styles.taskMenuDot} />
                                        <View style={styles.taskMenuDot} />
                                        <View style={styles.taskMenuDot} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            // Hiển thị thông báo khi không có task nào
                            <View style={styles.noTasksContainer}>
                                <Ionicons name="calendar-outline" size={48} color="#C0C0C0" />
                                <Text style={styles.noTasksText}>
                                    Không có task nào cho ngày này
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button để thêm task mới */}
            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Container chính của toàn bộ màn hình
    container: {
        flex: 1,
        backgroundColor: "#FDFDFF",
    },
    // Style cho container khi đang loading
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    // Style cho text loading
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6E7180",
    },
    // Style cho header với các icon
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    // Style cho mỗi icon trong header
    headerIcon: {
        width: 24,
        height: 24,
        position: "relative",
    },
    // Style cho notification dot
    notificationDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        backgroundColor: "#FF6B6B",
        borderRadius: 4,
    },
    // Style cho nội dung scroll được
    content: {
        flex: 1,
        paddingHorizontal: 18,
    },
    // Style cho container calendar
    calendar: {
        marginBottom: 32,
    },
    // Style cho mỗi ngày trong calendar
    calendarDay: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        minWidth: 50,
    },
    // Style cho ngày đang được chọn (active)
    calendarDayActive: {
        backgroundColor: "#4566EC",
    },
    // Style cho text tên ngày
    calendarDayText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#C0C0C0",
        marginBottom: 4,
    },
    // Style cho text tên ngày khi active
    calendarDayTextActive: {
        color: "#FFFFFF",
    },
    // Style cho text số ngày
    calendarDateText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#C0C0C0",
    },
    // Style cho text số ngày khi active
    calendarDateTextActive: {
        color: "#FFFFFF",
    },
    // Style cho dot indicator dưới ngày active
    calendarDot: {
        width: 4,
        height: 4,
        backgroundColor: "#FFFFFF",
        borderRadius: 2,
        marginTop: 4,
    },
    // Style cho section chứa các reminder card
    reminderSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
        gap: 16,
    },
    // Style cho mỗi reminder card
    reminderCard: {
        flex: 1,
        backgroundColor: "#EFF2FF",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    // Style cho icon trong reminder card
    reminderIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    // Style cho nội dung text trong reminder card
    reminderContent: {
        flex: 1,
    },
    // Style cho tiêu đề reminder
    reminderTitle: {
        fontSize: 12,
        fontWeight: "400",
        color: "#090E23",
        marginBottom: 4,
    },
    // Style cho số liệu trong reminder
    reminderNumber: {
        fontSize: 22,
        fontWeight: "600",
        color: "#090E23",
        marginBottom: 2,
    },
    // Style cho subtitle trong reminder
    reminderSubtitle: {
        fontSize: 10,
        fontWeight: "400",
        color: "#6E7180",
    },
    // Style cho section chứa danh sách tasks
    tasksSection: {
        marginBottom: 100, // Để tránh bị che bởi floating button
    },
    // Style cho header của tasks section
    tasksSectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    // Style cho tiêu đề tasks section
    tasksSectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    // Style cho text "View All"
    viewAllText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4566EC",
    },
    // Style cho container danh sách tasks
    tasksList: {
        gap: 16, // Khoảng cách giữa các task item
    },
    // Style cho mỗi task item
    taskItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        // Shadow cho Android và iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    // Style cho checkbox của task
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
    // Style cho checkbox khi task completed
    taskCheckboxCompleted: {
        backgroundColor: "#4566EC",
    },
    // Style cho checkbox rỗng (chưa completed)
    taskCheckboxEmpty: {
        width: 12,
        height: 12,
        backgroundColor: "transparent",
    },
    // Style cho nội dung task
    taskContent: {
        flex: 1,
    },
    // Style cho tiêu đề task
    taskTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#090E23",
        marginBottom: 4,
    },
    // Style cho tiêu đề task khi completed (gạch ngang)
    taskTitleCompleted: {
        textDecorationLine: "line-through",
        color: "#6E7180",
    },
    // Style cho mô tả task
    taskDescription: {
        fontSize: 12,
        color: "#6E7180",
        marginBottom: 4,
        lineHeight: 16,
    },
    // Style cho thời gian task
    taskTime: {
        fontSize: 11,
        color: "#4566EC",
        fontWeight: "500",
    },
    // Style cho menu 3 dots
    taskMenu: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingLeft: 8,
    },
    // Style cho mỗi dot trong menu
    taskMenuDot: {
        width: 3,
        height: 3,
        backgroundColor: "#C0C0C0",
        borderRadius: 1.5,
    },
    // Style cho container khi không có task
    noTasksContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    // Style cho text khi không có task
    noTasksText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6E7180",
        textAlign: "center",
    },
    // Style cho floating action button
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
        // Shadow cho button
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
