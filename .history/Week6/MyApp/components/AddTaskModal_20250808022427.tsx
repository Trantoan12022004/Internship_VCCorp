import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Interface cho Task
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
}

// Props cho modal
interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateTask: (taskData: Omit<Task, "_id" | "is_completed">) => Promise<void>;
    selectedDate?: Date;
}

export default function AddTaskModal({
    visible,
    onClose,
    onCreateTask,
    selectedDate = new Date(),
}: AddTaskModalProps) {
    // State cho form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [taskDate, setTaskDate] = useState(selectedDate);
    const [taskTime, setTaskTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset form khi modal đóng
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTaskDate(selectedDate);
        setTaskTime(new Date());
    };

    // Xử lý đóng modal
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Xử lý xác nhận chọn ngày
    const handleDateConfirm = (date: Date) => {
        setTaskDate(date);
        setShowDatePicker(false);
    };

    // Xử lý xác nhận chọn giờ
    const handleTimeConfirm = (time: Date) => {
        setTaskTime(time);
        setShowTimePicker(false);
    };

    // Xử lý hủy chọn ngày
    const handleDateCancel = () => {
        setShowDatePicker(false);
    };

    // Xử lý hủy chọn giờ
    const handleTimeCancel = () => {
        setShowTimePicker(false);
    };

    // Format date để gửi API
    const formatDateForAPI = (date: Date): string => {
        return date.toISOString();
    };

    // Format time để gửi API
    const formatTimeForAPI = (time: Date): string => {
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    // Validate form
    const validateForm = (): boolean => {
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề task");
            return false;
        }
        if (!description.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập mô tả task");
            return false;
        }
        return true;
    };

    // Xử lý tạo task
    const handleCreateTask = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const taskData = {
                title: title.trim(),
                description: description.trim(),
                date: formatDateForAPI(taskDate),
                time: formatTimeForAPI(taskTime),
            };

            await onCreateTask(taskData);
            handleClose();
        } catch (error) {
            console.error("Lỗi khi tạo task:", error);
            Alert.alert("Lỗi", "Không thể tạo task. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView style={styles.scrollView}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Thêm Task Mới</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Tiêu đề */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tiêu đề *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Nhập tiêu đề task"
                                    placeholderTextColor="#999"
                                    maxLength={100}
                                    keyboardType="default"
                                />
                            </View>

                            {/* Mô tả */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mô tả *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Nhập mô tả task"
                                    placeholderTextColor="#999"
                                    multiline={true}
                                    numberOfLines={4}
                                    maxLength={500}
                                />
                            </View>

                            {/* Ngày */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày</Text>
                                <TouchableOpacity
                                    style={styles.dateTimeButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.dateTimeText}>
                                        {taskDate.toLocaleDateString("vi-VN")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Giờ */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Giờ</Text>
                                <TouchableOpacity
                                    style={styles.dateTimeButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.dateTimeText}>
                                        {taskTime.toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.createButton,
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleCreateTask}
                                disabled={loading}
                            >
                                <Text style={styles.createButtonText}>
                                    {loading ? "Đang tạo..." : "Tạo Task"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Date Picker Modal */}
            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={handleDateCancel}
                date={taskDate}
                minimumDate={new Date()}
                locale="vi-VN"
            />

            {/* Time Picker Modal */}
            <DateTimePickerModal
                isVisible={showTimePicker}
                mode="time"
                onConfirm={handleTimeConfirm}
                onCancel={handleTimeCancel}
                date={taskTime}
                is24Hour={true}
                locale="vi-VN"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 15,
        width: "100%",
        maxWidth: 400,
        maxHeight: "90%",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    scrollView: {
        maxHeight: "100%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 18,
        color: "#999",
        fontWeight: "bold",
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    dateTimeButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#f9f9f9",
    },
    dateTimeText: {
        fontSize: 16,
        color: "#333",
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 20,
        paddingTop: 0,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    createButton: {
        backgroundColor: "#007AFF",
    },
    createButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
});
