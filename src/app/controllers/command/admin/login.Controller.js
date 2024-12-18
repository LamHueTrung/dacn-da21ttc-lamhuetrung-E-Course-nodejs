const Acounts = require('../../../model/Acount');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const Courses = require('../../../model/Course');
const Visits = require('../../../model/Visit');

class LoginAdmin {
    
    /**
     * Hàm Validate kiểm tra tính hợp lệ của dữ liệu đầu vào.
     * @param {Object} req - Request từ client
     * @returns {Object} - Các lỗi liên quan đến username và password nếu có.
     */
    Validate(req) {
        const { username, password } = req.body;
        let errors = {
            username: '',
            password: ''
        };

        // Kiểm tra tên đăng nhập có bị bỏ trống không
        const usernameError = Validator.notEmpty(username, 'Tên đăng nhập');
        if (usernameError) errors.username = usernameError;

        // Kiểm tra mật khẩu có bị bỏ trống không
        const passwordError = Validator.notEmpty(password, 'Mật khẩu');
        if (passwordError) errors.password = passwordError;

        // Kiểm tra mật khẩu có hợp lệ hay không
        const passwordValidation = Validator.isPassword(password);
        if (passwordValidation) errors.password = passwordValidation;

        // Kiểm tra tên đăng nhập có chứa ký tự tiếng Việt hay không
        const vietnameseCheck = Validator.containsVietnamese(username);
        if (vietnameseCheck) errors.username = vietnameseCheck;

        return errors;
    }

    /**
     * Hàm xử lý đăng nhập của quản trị viên.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     */
    Handle = async (req, res) => {
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại để hiển thị
        const errors = this.Validate(req); // Kiểm tra lỗi đầu vào

        // Nếu có lỗi đầu vào, trả lại form đăng nhập kèm theo các lỗi
        if (errors.username || errors.password) {
            return res.render('LoginAdmin', {
                layout: 'Login&Register',
                errors,
                username: req.body.username,
                password: req.body.password
            });
        }
        
        const { username, password } = req.body; // Lấy tên đăng nhập và mật khẩu từ yêu cầu

        try {
            // Tìm kiếm quản trị viên với tên đăng nhập từ cơ sở dữ liệu
            const admin = await Acounts.findOne({ username });
            if (!admin) {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: {
                        username: messages.login.usernameNotFound
                    },
                    username,
                    password
                });
            }

            // Kiểm tra nếu tài khoản đã bị xóa (soft delete)
            if (admin.isDeleted) {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: messages.login.usernamesoftDelete },
                    username,
                    password
                });
            }

            // Giải mã mật khẩu đã được mã hóa
            const decryptedPassword = CryptoService.decrypt(admin.password);
            if (password !== decryptedPassword) {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: {
                        password: messages.login.passwordCompaseFailed
                    },
                    username,
                    password
                });
            }

            // Kiểm tra vai trò của quản trị viên (chỉ cho phép hệ thống admin và sub admin đăng nhập)
            if (admin.role !== 'system_admin' && admin.role !== 'sub_admin') {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: messages.login.usernameNotRole },
                    username,
                    password
                });
            }

            // Tạo JWT token cho người dùng sau khi đăng nhập thành công
            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: admin._id, role: admin.role }, jwtSecretKey, { expiresIn: '1h' });
            req.session.token = token;  // Lưu token vào session
            req.session.isLoggedIn = true;  // Đánh dấu là đã đăng nhập

            // Lấy số lượng người dùng từ cơ sở dữ liệu
            const userCount = await Acounts.countDocuments({});
            const courseCount = await Courses.countDocuments({});
            const result = await Visits.aggregate([
                {
                  $group: {
                    _id: null, // Không cần nhóm theo bất kỳ trường nào
                    totalCount: { $sum: "$count" }, // Tổng tất cả các trường `count`
                  },
                },
              ]);
            const totalVisits = result.length > 0 ? result[0].totalCount : 0;

            // Trả về trang chính của quản trị viên với token và trạng thái đăng nhập
            return res.render('pages/admin/main', { layout: 'admin', token: token, isLoggedIn: req.session.isLoggedIn, currentYear: currentYear, userCount: userCount, courseCount: courseCount, visitCount: totalVisits });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error(messages.login.loginError, error);
            return res.status(500).json({ message: messages.serverError });
        }
    }
}

module.exports = new LoginAdmin();
