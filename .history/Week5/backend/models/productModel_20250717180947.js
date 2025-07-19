const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên sản phẩm'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá sản phẩm'],
      min: [0, 'Giá không thể âm'],
    },
    category: {
      type: String,
      required: [true, 'Vui lòng chọn danh mục'],
      enum: {
        values: ['Thực phẩm', 'Đồ uống', 'Gia vị', 'Đồ gia dụng', 'Chăm sóc cá nhân', 'Khác'],
        message: 'Danh mục không hợp lệ'
      }
    },
    brand: {
      type: String,
      required: [true, 'Vui lòng nhập thương hiệu'],
    },
    unit: {
      type: String,
      required: [true, 'Vui lòng nhập đơn vị tính'],
      enum: {
        values: ['kg', 'gram', 'lít', 'ml', 'chai', 'hộp', 'gói', 'cái', 'thùng'],
        message: 'Đơn vị tính không hợp lệ'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng tồn kho'],
      min: [0, 'Số lượng tồn kho không thể âm'],
      default: 0,
    },
    minStock: {
      type: Number,
      required: [true, 'Vui lòng nhập mức tồn kho tối thiểu'],
      min: [0, 'Mức tồn kho tối thiểu không thể âm'],
      default: 10,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null nhưng nếu có thì phải unique
    },
    image: {
      type: String,
      default: '/images/default-product.jpg',
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Vui lòng chọn nhà cung cấp'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

module.exports = mongoose.model('Product', productSchema);