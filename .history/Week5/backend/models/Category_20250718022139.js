const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    CategoryID: {
        type: Number,
        required: true,
        unique: true
    },
    CategoryName: {
        type: String,
        required: true,
        maxLength: 255
    },
    Description: {
        type: String
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;