const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên khách hàng'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      unique: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ'],
      sparse: true,
    },
    address: {
      type: String,
    },
    customerType: {
      type: String,
      enum: ['Khách lẻ', 'Khách sỉ', 'Khách VIP'],
      default: 'Khách lẻ',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Điểm tích lũy không thể âm'],
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: [0, 'Tổng chi tiêu không thể âm'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Giảm giá không thể âm'],
      max: [100, 'Giảm giá không thể quá 100%'],
    },
    notes: {
      type: String,
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

module.exports = mongoose.model('Customer', customerSchema);