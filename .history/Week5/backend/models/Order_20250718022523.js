const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    OrderID: {
        type: Number,
        required: true,
        unique: true
    },
    CustomerID: {
        type: Number,
        ref: 'Customer'
    },
    OrderDate: {
        type: Date,
        default: Date.now
    },
    ShipAddress: {
        type: String,
        maxLength: 255
    },
    ShipCity: {
        type: String,
        maxLength: 100
    },
    ShipPostalCode: {
        type: String,
        maxLength: 50
    },
    ShipCountry: {
        type: String,
        maxLength: 100
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;