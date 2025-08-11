const axios = require('axios');

// Test tạo task sẽ có notification sau 1-2 phút
async function createTestTask() {
    try {
        const now = new Date();
        const taskTime = new Date(now.getTime() + 16 * 60 * 1000); // 16 phút từ bây giờ
        
        const taskData = {
            title: `Test Notification - ${now.toLocaleTimeString()}`,
            description: 'Task để test notification trong vài phút',
            date: taskTime.toISOString().split('T')[0] + 'T00:00:00.000Z',
            time: taskTime.toTimeString().slice(0, 5)
        };

        console.log('⏰ Current time:', now.toLocaleTimeString());
        console.log('📅 Task will start at:', taskTime.toLocaleTimeString());
        console.log('🔔 Notification will trigger at:', new Date(taskTime.getTime() - 15 * 60 * 1000).toLocaleTimeString());

        const response = await axios.post('http://192.168.102.11:5000/api/task/create', taskData);
        
        if (response.data.success) {
            console.log('✅ Task created successfully!');
            console.log('📱 Check your app for notification in about 1 minute!');
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

createTestTask();
