import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    onSubmit: (taskData: Omit<Task, "_id" | "is_completed">) => void;
    selectedDate?: Date;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    onSubmit,
    selectedDate = new Date(),
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);

    // Format date for input
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Reset form
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTime("");
    };

    // Validate form
    const validateForm = (): boolean => {
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tiêu đề task");
            return false;
        }

        if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            Alert.alert(
                "Lỗi",
                "Định dạng thời gian không hợp lệ. Vui lòng sử dụng HH:MM (ví dụ: 14:30)"
            );
            return false;
        }

        return true;
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const taskData = {
                title: title.trim(),
                description: description.trim(),
                date: selectedDate.toISOString(),
                time: time || "00:00",
            };

            await onSubmit(taskData);
            resetForm();
            onClose();
        } catch (error) {
            console.error("Error creating task:", error);
            Alert.alert("Lỗi", "Không thể tạo task. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Tạo Task Mới</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={24} color="#6E7180" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Date Display */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày</Text>
                                <View style={styles.dateDisplay}>
                                    <Ionicons name="calendar-outline" size={20} color="#4566EC" />
                                    <Text style={styles.dateText}>
                                        {selectedDate.toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </Text>
                                </View>
                            </View>

                            {/* Title Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    Tiêu đề <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Nhập tiêu đề task..."
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                    autoFocus={true}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mô tả</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Nhập mô tả chi tiết..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline={true}
                                    numberOfLines={4}
                                    maxLength={500}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Time Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Thời gian</Text>
                                <View style={styles.timeInputContainer}>
                                    <Ionicons name="time-outline" size={20} color="#4566EC" />
                                    <TextInput
                                        style={styles.timeInput}
                                        placeholder="HH:MM (ví dụ: 14:30)"
                                        value={time}
                                        onChangeText={setTime}
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>
                                <Text style={styles.hint}>
                                    Để trống nếu không có thời gian cụ thể
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (!title.trim() || loading) && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={!title.trim() || loading}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.submitButtonText}>
                                    {loading ? "Đang tạo..." : "Tạo Task"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        minHeight: "60%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#090E23",
    },
    closeButton: {
        padding: 4,
    },
    form: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#090E23",
        marginBottom: 8,
    },
    required: {
        color: "#FF4444",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#090E23",
        backgroundColor: "#FAFAFA",
    },
    textArea: {
        height: 80,
        paddingTop: 12,
    },
    dateDisplay: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF2FF",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    dateText: {
        fontSize: 16,
        color: "#4566EC",
        fontWeight: "500",
    },
    timeInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: "#FAFAFA",
        gap: 8,
    },
    timeInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: "#090E23",
    },
    hint: {
        fontSize: 12,
        color: "#6E7180",
        marginTop: 4,
        fontStyle: "italic",
    },
    footer: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#6E7180",
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#4566EC",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#C0C0C0",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#FFFFFF",
    },
});

export default AddTaskModal;
