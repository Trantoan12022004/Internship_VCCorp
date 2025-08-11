const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    pushToken: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    sentAt: {
        type: Date
    }
});

module.exports = mongoose.model('Notification', notificationSchema);