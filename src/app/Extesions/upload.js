const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đường dẫn tới thư mục uploads
const uploadDir = path.join(__dirname, '../../public/avatars');

// Kiểm tra và tạo thư mục nếu không tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

// Thiết lập nơi lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Tạo tên file độc nhất
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Tạo middleware multer
const upload = multer({ storage: storage });

module.exports = upload;
