const mongoose = require("mongoose");

const supplierSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên nhà cung cấp"],
            trim: true,
        },
        contactPerson: {
            type: String,
            required: [true, "Vui lòng nhập tên người liên hệ"],
        },
        phone: {
            type: String,
            required: [true, "Vui lòng nhập số điện thoại"],
            match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
        },
        email: {
            type: String,
            required: [true, "Vui lòng nhập email"],
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email không hợp lệ"],
        },
        address: {
            street: {
                type: String,
                required: [true, "Vui lòng nhập địa chỉ"],
            },
            city: {
                type: String,
                required: [true, "Vui lòng nhập thành phố"],
            },
            province: {
                type: String,
                required: [true, "Vui lòng nhập tỉnh/thành phố"],
            },
        },
        taxCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        paymentTerms: {
            type: String,
            enum: ["Tiền mặt", "Chuyển khoản", "Công nợ 7 ngày", "Công nợ 15 ngày", "Công nợ 30 ngày"],
            default: "Tiền mặt",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Supplier", supplierSchema);
