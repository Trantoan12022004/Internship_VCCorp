require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Kết nối database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trong chế độ ${process.env.NODE_ENV} trên cổng ${PORT}`);
});

// Xử lý lỗi unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
  console.log(err.name, err.message);
  process.exit(1);
});
