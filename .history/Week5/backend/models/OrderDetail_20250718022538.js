const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    OrderDetailID: {
        type: Number,
        required: true,
        unique: true
    },
    OrderID: {
        type: Number,
        ref: 'Order',
        required: true
    },
    ProductID: {
        type: Number,
        ref: 'Product',
        required: true
    },
    Quantity: {
        type: Number,
        required: true,
        min: 1
    },
    UnitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    Discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);

module.exports = OrderDetail;