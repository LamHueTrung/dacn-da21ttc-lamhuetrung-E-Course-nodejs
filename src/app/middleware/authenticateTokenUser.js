const jwt = require('jsonwebtoken');

// Middleware kiểm tra và xác thực token JWT
const authenticateToken = (req, res, next) => {
    // Lấy token từ session
    const token = req.session.tokenUser;

    // Kiểm tra xem có token không, nếu không có thì chuyển hướng đến trang login
    if (!token) {
        return res.redirect('/User/Login');
    }

    // Xác minh token với khóa bí mật
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        // Nếu có lỗi xác minh token (token không hợp lệ hoặc hết hạn), chuyển hướng đến trang login
        if (err) {
            return res.redirect('/User/Login');
        }

        // Lưu thông tin người dùng từ token vào đối tượng request để có thể sử dụng ở các route tiếp theo
        req.user = decoded; 

    });

    // Tiến hành chuyển đến middleware tiếp theo hoặc route handler
    next(); 
};

module.exports = authenticateToken;
