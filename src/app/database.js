const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 450000
        });
        console.log('Kết nối thành công tới MongoDB');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error);
        setTimeout(connectDB, 5000);
    }
};

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
