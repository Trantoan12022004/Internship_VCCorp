const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    CustomerName: {
        type: String,
        required: true,
        maxLength: 255
    },
    ContactName: {
        type: String,
        maxLength: 255
    },
    Address: {
        type: String,
        maxLength: 255
    },
    City: {
        type: String,
        maxLength: 100
    },
    PostalCode: {
        type: String,
        maxLength: 50
    },
    Country: {
        type: String,
        maxLength: 100
    },
    Phone: {
        type: String,
        maxLength: 20
    }
}, {
    timestamps: true
});

const Customer = mongoose.model('console.log("Collection name:", Customer.collection.name);', customerSchema);

module.exports = Customer;