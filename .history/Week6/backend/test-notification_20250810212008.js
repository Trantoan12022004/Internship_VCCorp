const axios = require('axios');
const moment = require('moment-timezone');

const API_BASE = 'http://localhost:5000/api/task';

// Test scenario: Tạo task sẽ có notification trong 1-2 phút
async function testNotificationSystem() {
    try {
        console.log('🧪 TESTING NOTIFICATION SYSTEM');
        console.log('================================');

        // 1. Tạo task sẽ diễn ra sau 16 phút (notification sẽ trigger sau 1 phút)
        const taskTime = moment().add(16, 'minutes');
        const notificationTime = taskTime.clone().subtract(15, 'minutes'); // 1 phút từ bây giờ

        console.log('⏰ Current time:', moment().format('HH:mm:ss DD/MM/YYYY'));
        console.log('📅 Task will start at:', taskTime.format('HH:mm:ss DD/MM/YYYY'));
        console.log('🔔 Notification will trigger at:', notificationTime.format('HH:mm:ss DD/MM/YYYY'));
        console.log('⏳ Notification in:', notificationTime.fromNow());

        const taskData = {
            title: `Test Notification - ${moment().format('HH:mm:ss')}`,
            description: 'Task để test notification trong 1 phút',
            date: taskTime.format('YYYY-MM-DD') + 'T00:00:00.000Z',
            time: taskTime.format('HH:mm')
        };

        console.log('\n📝 Creating test task...');
        const createResponse = await axios.post(`${API_BASE}/create`, taskData);
        console.log('✅ Task created:', createResponse.data.data.title);
        console.log('🆔 Task ID:', createResponse.data.data._id);

        // 2. Kiểm tra notifications
        console.log('\n🔍 Checking scheduled notifications...');
        const notificationsResponse = await axios.get(`${API_BASE}/notifications`);
        console.log(`📊 Total notifications scheduled: ${notificationsResponse.data.totalScheduled}`);
        
        // Tìm notification của task vừa tạo
        const ourNotification = notificationsResponse.data.data.find(n => n.taskId === createResponse.data.data._id);
        if (ourNotification) {
            console.log('🎯 Our notification found:');
            console.log(`   - Task: ${ourNotification.title}`);
            console.log(`   - Will trigger: ${ourNotification.timeToNotification}`);
            console.log(`   - Active: ${ourNotification.isActive}`);
        }

        console.log('\n⏰ Wait for notification to trigger...');
        console.log('💡 Check server console logs for notification output!');

        return createResponse.data.data._id;

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test toggle complete
async function testToggleComplete(taskId) {
    try {
        console.log('\n🔄 Testing toggle complete (should cancel notification)...');
        const response = await axios.patch(`${API_BASE}/${taskId}/toggle`);
        console.log('✅ Task toggled:', response.data.message);

        // Check notifications again
        const notificationsResponse = await axios.get(`${API_BASE}/notifications`);
        console.log(`📊 Notifications after toggle: ${notificationsResponse.data.totalScheduled}`);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Main test
async function runTests() {
    const taskId = await testNotificationSystem();
    
    if (taskId) {
        // Wait 70 seconds then toggle complete to test cancellation
        setTimeout(() => {
            testToggleComplete(taskId);
        }, 70000); // 70 seconds
    }
}

runTests();
