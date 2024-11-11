const jwt = require('jsonwebtoken');
const messages = require('../../../Extesions/messCost');
const Acounts = require('../../../model/Acount');
const Courses = require('../../../model/Course');

class AdminQuery {
    
    /**
     * Hàm Logout: Xử lý quá trình đăng xuất của quản trị viên.
     * - Xóa session và cookie liên quan đến đăng nhập.
     * - Trả về thông báo thành công hoặc lỗi.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    Logout(req, res, next) {
        req.session.isLoggedIn = false;  // Đánh dấu người dùng đã đăng xuất
        req.session.isChangePassword = false;  // Đánh dấu trạng thái không thay đổi mật khẩu
        req.session.destroy(err => {
            if (err) {
                console.error(messages.session.sessionDestroyFailed, err);  // Ghi log nếu có lỗi khi hủy session
                return res.status(500).json({ message: messages.session.sessionDestroyFailed });  // Trả về lỗi nếu hủy session thất bại
            }
    
            res.clearCookie('connect.sid');  // Xóa cookie phiên làm việc
            res.status(200).json({ message: messages.session.sessionDestroySucces });  // Trả về thông báo đăng xuất thành công
        });
    }

    /**
     * Hàm Login: Xử lý trang đăng nhập.
     * - Nếu người dùng đã đăng nhập (có token trong session), chuyển hướng đến trang chủ quản trị viên.
     * - Nếu không có token, trả về trang đăng nhập.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    Login(req, res, next) {
        const token = req.session.token;  // Lấy token từ session
        if (token) {
            // Kiểm tra tính hợp lệ của token
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (!err) {
                    // Nếu token hợp lệ, chuyển hướng đến trang chủ của quản trị viên
                    return res.redirect('/admin/home');
                }
            });
        }

        // Nếu không có token, trả về trang đăng nhập
        res.render('LoginAdmin', { layout: 'Login&Register' });
    }

    /**
     * Hàm Index: Xử lý trang chủ của quản trị viên.
     * - Trả về trang chủ với năm hiện tại, token, trạng thái đăng nhập và số lượng người dùng.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    async Index(req, res, next) {
        const currentYear = new Date().getFullYear();  // Lấy năm hiện tại để hiển thị
        
        try {
            const userCount = await Acounts.countDocuments({});
            const courseCount = await Courses.countDocuments({});

            // Trả về trang chủ với thông tin người dùng và các dữ liệu khác
            res.render('pages/admin/main', { 
                layout: 'admin',  // Sử dụng layout admin
                year: currentYear,  // Hiển thị năm hiện tại
                token: req.session.token,  // Token người dùng từ session
                isLoggedIn: req.session.isLoggedIn,  // Trạng thái đăng nhập từ session
                userCount: userCount,  // Số lượng người dùng
                courseCount: courseCount // Số lượng khóa học
            });
        } catch (error) {
            console.error('Lỗi khi lấy số lượng người dùng:', error);
            return res.status(500).json({ message: 'Không thể lấy số lượng người dùng.' });
        }
    }

};

module.exports = new AdminQuery;
