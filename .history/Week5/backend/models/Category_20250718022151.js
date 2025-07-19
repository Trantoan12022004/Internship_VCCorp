const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {

        CategoryName: {
            type: String,
            required: true,
            maxLength: 255,
        },
        Description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
