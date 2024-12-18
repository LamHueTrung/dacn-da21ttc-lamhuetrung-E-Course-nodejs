const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    const mongoURIs = [
        process.env.MONGODB_URI_ONLINE, // Ưu tiên kết nối online
        process.env.MONGODB_URI_LOCAL   // Sau đó thử kết nối local
    ];

    for (let i = 0; i < mongoURIs.length; i++) {
        try {
            await mongoose.connect(mongoURIs[i], {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 450000
            });
            console.log(`Kết nối thành công tới MongoDB: ${i === 0 ? 'Online' : 'Local'}`);
            return; // Thoát khỏi vòng lặp nếu kết nối thành công
        } catch (error) {
            console.error(`Không thể kết nối tới MongoDB ${i === 0 ? 'Online' : 'Local'}:`, error.message);
        }
    }

    // Nếu cả hai kết nối đều thất bại
    console.error('Không thể kết nối tới bất kỳ MongoDB nào. Vui lòng kiểm tra cấu hình.');
    process.exit(1); // Thoát ứng dụng với mã lỗi
};

// Các sự kiện kết nối MongoDB
mongoose.connection.on('connected', () => {
    console.log('MongoDB đã được kết nối.');
});

mongoose.connection.on('error', (err) => {
    console.error('Lỗi kết nối MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB đã ngắt kết nối.');
});

module.exports = connectDB;
