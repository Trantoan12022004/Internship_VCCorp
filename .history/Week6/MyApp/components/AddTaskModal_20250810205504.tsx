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
    ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { suggestAI } from "../sevices/api"; // Import API functions

// Interface cho Task
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
}

// Interface cho AI Suggestion Response
interface AISuggestion {
    recommendedTime: string;
    reason: string;
    confidence?: number;
    workType?: string;
    tips?: string;
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
    // ========== STATE MANAGEMENT ==========
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [taskDate, setTaskDate] = useState(selectedDate);
    const [taskTime, setTaskTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // AI Suggestion states
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    const [showAISuggestion, setShowAISuggestion] = useState(false);

    // ========== HELPER FUNCTIONS ==========

    // Reset form khi modal đóng
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setTaskDate(selectedDate);
        setTaskTime(new Date());
        setAiSuggestion(null);
        setShowAISuggestion(false);
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
        // Reset AI suggestion khi thay đổi ngày
        setAiSuggestion(null);
        setShowAISuggestion(false);
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

    // Format date để gửi API - sử dụng format manual để tránh timezone issue
    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        // Trả về format YYYY-MM-DD với thời gian mặc định 00:00:00 UTC
        const dateString = `${year}-${month}-${day}T00:00:00.000Z`;

        console.log("=== FORMAT DATE FOR API ===");
        console.log("Original date:", date.toLocaleDateString("vi-VN"));
        console.log("Date components:", { year, month, day });
        console.log("Formatted for API:", dateString);

        return dateString;
    };

    // Format time để gửi API
    const formatTimeForAPI = (time: Date): string => {
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    // Validate form cho AI suggestion
    const validateFormForAI = (): boolean => {
        if (!title.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập tiêu đề task để AI có thể gợi ý");
            return false;
        }
        return true;
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

    // Gọi AI Suggestion API - SỬA LẠI
    const handleAISuggestion = async () => {

            console.log("=== CALLING AI SUGGESTION ===");

            const requestData = {
                title: title.trim(),
                description: description.trim() || "Không có mô tả",
                date: formatDateForAPI(taskDate),
            };

            console.log("AI Request data:", requestData);

            const response = await suggestAI(requestData);
            console.log("AI Response:", response);

            
    };

    // Áp dụng gợi ý AI
    const applyAISuggestion = () => {
        if (aiSuggestion && aiSuggestion.recommendedTime) {
            try {
                const [hours, minutes] = aiSuggestion.recommendedTime.split(':');
                const newTime = new Date();
                newTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                setTaskTime(newTime);
                setShowAISuggestion(false);
                Alert.alert("Thành công", "Đã áp dụng thời gian gợi ý từ AI!");
            } catch (error) {
                console.error("Lỗi khi áp dụng thời gian AI:", error);
                Alert.alert("Lỗi", "Không thể áp dụng thời gian gợi ý. Vui lòng thử lại.");
            }
        }
    };

    // Xử lý tạo task
    const handleCreateTask = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log("=== CREATING TASK ===");
            console.log("Selected taskDate:", taskDate.toLocaleDateString("vi-VN"));
            console.log("taskDate getDate():", taskDate.getDate());
            console.log("taskDate getMonth():", taskDate.getMonth() + 1);
            console.log("taskDate getFullYear():", taskDate.getFullYear());

            const formattedDate = formatDateForAPI(taskDate);
            const formattedTime = formatTimeForAPI(taskTime);

            const taskData = {
                title: title.trim(),
                description: description.trim(),
                date: formattedDate,
                time: formattedTime,
            };

            console.log("Task data to send:", taskData);

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
                                    onChangeText={(text) => {
                                        setTitle(text);
                                        // Reset AI suggestion khi thay đổi title
                                        if (aiSuggestion) {
                                            setAiSuggestion(null);
                                            setShowAISuggestion(false);
                                        }
                                    }}
                                    placeholder="Nhập tiêu đề task"
                                    placeholderTextColor="#999"
                                    maxLength={100}
                                    keyboardType="default"
                                />
                            </View>

                            {/* Mô tả */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mô tả</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={(text) => {
                                        setDescription(text);
                                        // Reset AI suggestion khi thay đổi description
                                        if (aiSuggestion) {
                                            setAiSuggestion(null);
                                            setShowAISuggestion(false);
                                        }
                                    }}
                                    placeholder="Nhập mô tả task (tùy chọn)"
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

                            {/* AI Suggestion Button */}
                            <View style={styles.inputGroup}>
                                <TouchableOpacity
                                    style={[
                                        styles.aiButton,
                                        (aiLoading || !title.trim()) && styles.disabledButton,
                                    ]}
                                    onPress={handleAISuggestion}
                                    disabled={aiLoading || !title.trim()}
                                >
                                    <View style={styles.aiButtonContent}>
                                        {aiLoading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={styles.aiButtonIcon}>🤖</Text>
                                        )}
                                        <Text style={styles.aiButtonText}>
                                            {aiLoading ? "Đang phân tích..." : "Gợi ý thời gian bằng AI"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* AI Suggestion Result */}
                            {showAISuggestion && aiSuggestion && (
                                <View style={styles.aiSuggestionContainer}>
                                    <Text style={styles.aiSuggestionTitle}>🎯 Gợi ý từ AI</Text>
                                    
                                    <View style={styles.aiSuggestionContent}>
                                        <View style={styles.aiSuggestionRow}>
                                            <Text style={styles.aiSuggestionLabel}>Thời gian đề xuất:</Text>
                                            <Text style={styles.aiSuggestionValue}>
                                                {aiSuggestion.recommendedTime}
                                            </Text>
                                        </View>
                                        
                                        {aiSuggestion.workType && (
                                            <View style={styles.aiSuggestionRow}>
                                                <Text style={styles.aiSuggestionLabel}>Loại công việc:</Text>
                                                <Text style={styles.aiSuggestionValue}>
                                                    {aiSuggestion.workType}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        <View style={styles.aiSuggestionRow}>
                                            <Text style={styles.aiSuggestionLabel}>Lý do:</Text>
                                            <Text style={styles.aiSuggestionReason}>
                                                {aiSuggestion.reason}
                                            </Text>
                                        </View>
                                        
                                        {aiSuggestion.tips && (
                                            <View style={styles.aiSuggestionRow}>
                                                <Text style={styles.aiSuggestionLabel}>💡 Gợi ý thêm:</Text>
                                                <Text style={styles.aiSuggestionTips}>
                                                    {aiSuggestion.tips}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    
                                    <View style={styles.aiSuggestionButtons}>
                                        <TouchableOpacity
                                            style={styles.aiApplyButton}
                                            onPress={applyAISuggestion}
                                        >
                                            <Text style={styles.aiApplyButtonText}>Áp dụng</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity
                                            style={styles.aiDismissButton}
                                            onPress={() => setShowAISuggestion(false)}
                                        >
                                            <Text style={styles.aiDismissButtonText}>Bỏ qua</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

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
                // minimumDate={new Date()}
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
    
    // AI Suggestion Styles
    aiButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    aiButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    aiButtonIcon: {
        fontSize: 16,
    },
    aiButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    
    // AI Suggestion Result Styles
    aiSuggestionContainer: {
        backgroundColor: "#f8f9ff",
        borderWidth: 1,
        borderColor: "#4CAF50",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    aiSuggestionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4CAF50",
        marginBottom: 12,
        textAlign: "center",
    },
    aiSuggestionContent: {
        marginBottom: 16,
    },
    aiSuggestionRow: {
        marginBottom: 8,
    },
    aiSuggestionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    aiSuggestionValue: {
        fontSize: 16,
        color: "#4CAF50",
        fontWeight: "bold",
    },
    aiSuggestionReason: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    aiSuggestionTips: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        fontStyle: "italic",
    },
    aiSuggestionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    aiApplyButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    aiApplyButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    aiDismissButton: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    aiDismissButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
});