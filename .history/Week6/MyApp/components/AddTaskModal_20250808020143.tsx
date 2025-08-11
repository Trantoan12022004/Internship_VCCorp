import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Task {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    is_completed: boolean;
}

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
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [taskDate, setTaskDate] = useState(selectedDate);
    const [taskTime, setTaskTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setTitle("");
            setDescription("");
            setTaskDate(selectedDate);
            setTaskTime(new Date());
        }
    }, [visible, selectedDate]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (time: Date): string => {
        return time.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTaskDate(selectedDate);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setTaskTime(selectedTime);
        }
    };

    const handleCreateTask = async () => {
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề task");
            return;
        }

        try {
            setLoading(true);

            // Format date to ISO string
            const formattedDate = taskDate.toISOString();

            // Format time to HH:MM
            const formattedTime = formatTime(taskTime);

            const taskData = {
                title: title.trim(),
                description: description.trim(),
                date: formattedDate,
                time: formattedTime,
            };

            await onCreateTask(taskData);
        } catch (error) {
            console.error("Error in handleCreateTask:", error);
            Alert.alert("Lỗi", "Không thể tạo task. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#090E23" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Tạo Task Mới</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tiêu đề *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tiêu đề task..."
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nhập mô tả task..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                            />
                        </View>

                        {/* Date Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ngày</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#4566EC" />
                                <Text style={styles.dateTimeText}>{formatDate(taskDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Time Picker */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Thời gian</Text>
                            <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time-outline" size={20} color="#4566EC" />
                                <Text style={styles.dateTimeText}>{formatTime(taskTime)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.createButton, loading && styles.createButtonDisabled]}
                            onPress={handleCreateTask}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.createButtonText}>Tạo Task</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Date Picker Modal */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={taskDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {/* Time Picker Modal */}
                    {showTimePicker && (
                        <DateTimePicker
                            value={taskTime}
                            mode="time"
                            display="default"
                            onChange={handleTimeChange}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    placeholder: {
        width: 32,
    },
    form: {
        padding: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#090E23",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: "#090E23",
        backgroundColor: "#FDFDFF",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    dateTimeButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#FDFDFF",
        gap: 8,
    },
    dateTimeText: {
        fontSize: 14,
        color: "#090E23",
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        paddingHorizontal: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6E7180",
    },
    createButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#4566EC",
        alignItems: "center",
        justifyContent: "center",
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#FFFFFF",
    },
});
