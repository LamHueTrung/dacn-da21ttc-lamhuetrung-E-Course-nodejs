const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs'); 

// Đường dẫn lưu trữ tệp tải lên (avatars)
const uploadDir = path.join(__dirname, '../../public/avatars');

// Kiểm tra xem thư mục tải lên đã tồn tại chưa. Nếu chưa, tạo thư mục.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
    /**
     * Hàm xác định thư mục lưu trữ tệp tải lên
     * @param {Object} req - Yêu cầu HTTP
     * @param {Object} file - Thông tin về tệp
     * @param {function} cb - Hàm callback để chỉ định thư mục lưu trữ
     */
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },

    /**
     * Hàm xác định tên tệp khi lưu
     * Tạo tên tệp duy nhất dựa trên thời gian hiện tại và một số ngẫu nhiên
     * @param {Object} req - Yêu cầu HTTP
     * @param {Object} file - Thông tin về tệp
     * @param {function} cb - Hàm callback để chỉ định tên tệp
     */
    filename: (req, file, cb) => {
        // Tạo một chuỗi duy nhất sử dụng thời gian hiện tại và một số ngẫu nhiên
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Lấy phần mở rộng của tệp gốc (ví dụ: .jpg, .png) và nối vào tên duy nhất
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Khởi tạo multer với cấu hình lưu trữ
const upload = multer({ storage: storage });

module.exports = upload;
