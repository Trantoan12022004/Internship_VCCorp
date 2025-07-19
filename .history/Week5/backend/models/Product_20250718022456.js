const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        ProductID: {
            type: Number,
            required: true,
            unique: true,
        },
        ProductName: {
            type: String,
            required: true,
            maxLength: 255,
        },
        CategoryID: {
            type: Number,
            ref: "Category",
        },
        QuantityPerUnit: {
            type: String,
            maxLength: 255,
        },
        UnitPrice: {
            type: Number,
            min: 0,
        },
        UnitsInStock: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
