const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không thể âm'],
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không thể âm'],
  },
});

const orderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: false, // Cho phép khách vãng lai
    },
    customerInfo: {
      name: String,
      phone: String,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Tạm tính không thể âm'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Giảm giá không thể âm'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Thuế không thể âm'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Tổng tiền không thể âm'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Tiền mặt', 'Chuyển khoản', 'Thẻ tín dụng', 'Ví điện tử'],
      default: 'Tiền mặt',
    },
    paymentStatus: {
      type: String,
      enum: ['Chưa thanh toán', 'Đã thanh toán', 'Thanh toán một phần'],
      default: 'Đã thanh toán',
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Số tiền đã thanh toán không thể âm'],
    },
    status: {
      type: String,
      enum: ['Đang xử lý', 'Đã hoàn thành', 'Đã hủy'],
      default: 'Đã hoàn thành',
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Tự động tạo số đơn hàng
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Đếm số đơn hàng trong ngày
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const orderNum = (count + 1).toString().padStart(3, '0');
    this.orderNumber = `DH${year}${month}${day}${orderNum}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);