import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { getNotifications, toggleTaskComplete } from '../sevices/api';

interface TaskNotification {
    taskId: string;
    title: string;
    taskTime: string;
    notificationTime: string;
    isActive: boolean;
    timeToNotification: string;
}

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<TaskNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch notifications từ server
    const fetchNotifications = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await getNotifications();
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refresh notifications
    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications(false);
    };

    // Đánh dấu task hoàn thành
    const handleMarkComplete = async (taskId: string, title: string) => {
        try {
            const response = await toggleTaskComplete(taskId);
            
            if (response.data.success) {
                Alert.alert("Thành công", `Task "${title}" đã được đánh dấu hoàn thành!`);
                fetchNotifications(false);
            }
        } catch (error) {
            console.error('Error marking task complete:', error);
            Alert.alert("Lỗi", "Không thể đánh dấu task hoàn thành");
        }
    };

    // Format time display
    const formatTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    };

    // Get status color
    const getStatusColor = (notification: TaskNotification) => {
        if (!notification.isActive) return '#999';
        
        const now = new Date();
        const notificationTime = new Date(notification.notificationTime);
        const timeDiff = notificationTime.getTime() - now.getTime();
        
        if (timeDiff <= 60000) return '#ff4444'; // Đỏ - sắp trigger
        if (timeDiff <= 300000) return '#ff8800'; // Cam - trong 5 phút
        return '#4CAF50'; // Xanh - còn lâu
    };

    // Render notification item
    const renderNotificationItem = ({ item }: { item: TaskNotification }) => (
        <View style={[styles.notificationItem, { borderLeftColor: getStatusColor(item) }]}>
            <View style={styles.notificationHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item) }]} />
            </View>
            
            <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Task: {formatTime(item.taskTime)}</Text>
                <Text style={styles.timeLabel}>Nhắc: {formatTime(item.notificationTime)}</Text>
            </View>
            
            <Text style={styles.timeToNotification}>{item.timeToNotification}</Text>
            
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleMarkComplete(item.taskId, item.title)}
                >
                    <Text style={styles.completeButtonText}>Hoàn thành</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    useEffect(() => {
        fetchNotifications();
        
        // Auto refresh mỗi 30 giây
        const interval = setInterval(() => {
            fetchNotifications(false);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo Tasks</Text>
                <Text style={styles.headerSubtitle}>
                    {notifications.length} notifications được lên lịch
                </Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.taskId}
                renderItem={renderNotificationItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Đang tải...' : 'Không có notifications nào'}
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    timeInfo: {
        marginBottom: 8,
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    timeToNotification: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    completeButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
