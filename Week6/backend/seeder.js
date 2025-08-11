const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Supplier = require("./models/supplierModel");
const Product = require("./models/productModel");
const Customer = require("./models/customerModel");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const suppliers = [
    {
        name: "Công ty TNHH Thực phẩm Sạch",
        contactPerson: "Nguyễn Văn A",
        phone: "0901234567",
        email: "contact@thucphamsach.com",
        address: {
            street: "123 Đường ABC",
            city: "Quận 1",
            province: "TP.HCM",
        },
        paymentTerms: "Công nợ 15 ngày",
    },
    {
        name: "Nhà phân phối đồ uống XYZ",
        contactPerson: "Trần Thị B",
        phone: "0987654321",
        email: "info@douongxyz.com",
        address: {
            street: "456 Đường DEF",
            city: "Quận 3",
            province: "TP.HCM",
        },
        paymentTerms: "Tiền mặt",
    },
];

const customers = [
    {
        name: "Lê Văn C",
        phone: "0912345678",
        email: "levanc@email.com",
        address: "789 Đường GHI, Quận 5, TP.HCM",
        customerType: "Khách VIP",
        loyaltyPoints: 150,
    },
    {
        name: "Phạm Thị D",
        phone: "0923456789",
        customerType: "Khách lẻ",
    },
];

const seedData = async () => {
    try {
        // Xóa dữ liệu cũ
        await Supplier.deleteMany();
        await Product.deleteMany();
        await Customer.deleteMany();

        // Tạo nhà cung cấp
        const createdSuppliers = await Supplier.insertMany(suppliers);
        console.log("Nhà cung cấp đã được tạo");

        // Tạo sản phẩm
        const products = [
            {
                name: "Gạo ST25",
                description: "Gạo thơm cao cấp",
                price: 25000,
                category: "Thực phẩm",
                brand: "ST25",
                unit: "kg",
                stock: 100,
                minStock: 20,
                supplier: createdSuppliers[0]._id,
            },
            {
                name: "Nước mắm Nam Ngư",
                description: "Nước mắm truyền thống",
                price: 35000,
                category: "Gia vị",
                brand: "Nam Ngư",
                unit: "chai",
                stock: 50,
                minStock: 10,
                supplier: createdSuppliers[0]._id,
            },
            {
                name: "Coca Cola",
                description: "Nước ngọt có ga",
                price: 12000,
                category: "Đồ uống",
                brand: "Coca Cola",
                unit: "chai",
                stock: 200,
                minStock: 50,
                supplier: createdSuppliers[1]._id,
            },
        ];

        await Product.insertMany(products);
        console.log("Sản phẩm đã được tạo");

        // Tạo khách hàng
        await Customer.insertMany(customers);
        console.log("Khách hàng đã được tạo");

        console.log("✅ Dữ liệu mẫu đã được tạo thành công!");
        process.exit();
    } catch (error) {
        console.error("❌ Lỗi:", error);
        process.exit(1);
    }
};

seedData();
