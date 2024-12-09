const Acounts = require('../../../model/Acount');
const Courses = require('../../../model/Course');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const currentYear = new Date().getFullYear();
const jwt = require('jsonwebtoken');


/**
 * Class CreateUser
 * Chức năng: Xử lý tạo tài khoản người dùng mới cho quản trị viên
 * - Hàm `Validate`: Thực hiện kiểm tra dữ liệu đầu vào của người dùng.
 * - Hàm `Handle`: Kiểm tra dữ liệu và xử lý logic tạo người dùng mới.
 */
class Login {

    /**
     * Hàm Validate
     * Kiểm tra tính hợp lệ của các trường nhập từ request.
     * @param {Object} req - Đối tượng request chứa thông tin người dùng.
     * @returns {Object} errors - Đối tượng chứa các thông báo lỗi tương ứng với từng input.
     */
    Validate(req) {
        // Lấy dữ liệu từ request body
        const {
            userName,
            password,
        } = req.body;

        // Khởi tạo đối tượng lưu lỗi cho từng trường
        let errors = {
            userName: '',
            password: '',
            
        };

        // Kiểm tra tính hợp lệ của tên người dùng
        const userNameError =
            Validator.notEmpty(userName, 'User name') ||
            Validator.notNull(userName, 'User name') ||
            Validator.maxLength(userName, 50, 'User name') ||
            Validator.containsVietnamese(userName);  // Kiểm tra tên có chứa ký tự tiếng Việt
        if (userNameError) errors.userName = userNameError;

        // Kiểm tra tính hợp lệ của mật khẩu
        const passwordError =
            Validator.notEmpty(password, 'Mật khẩu') ||
            Validator.notNull(password, 'Mật khẩu') ||
            Validator.isPassword(password)
        if (passwordError) errors.password = passwordError;

        return errors;
    }

    /**
     * Hàm Handle
     * Xử lý logic tạo tài khoản người dùng mới sau khi đã xác thực thông tin.
     * @param {Object} req - Đối tượng request chứa thông tin người dùng.
     * @param {Object} res - Đối tượng response để trả về dữ liệu.
     */
    Handle = async (req, res) => {
        // Gọi hàm Validate để lấy danh sách lỗi nếu có
        const errors = this.Validate(req);
        const hasErrors = Object.values(errors).some(error => error !== '');

        // Kiểm tra nếu có lỗi, trả về giao diện thêm người dùng kèm thông báo lỗi
        if (hasErrors) {
            return res.render('Login', {
                layout: 'Login&Register',
                errors,
                ...req.body,
                currentYear: currentYear
            });
        }

        // Lấy thông tin người dùng từ request body
        const { userName, password } = req.body;

        try {
            // Kiểm tra sự tồn tại của tên tài khoản
            const existingAccount = await Acounts.findOne({ username: userName });
            if (!existingAccount) {
                return res.render('Login', {
                    layout: 'Login&Register',
                    errors: { userName: messages.login.usernameNotFound },
                    ...req.body,
                    currentYear: currentYear
                });
            }

            if (existingAccount.isDeleted) {
                return res.render('Login', {
                    layout: 'Login&Register',
                    errors: { userName: messages.login.usernamesoftDelete },
                    ...req.body,
                });
            }

            // Kiểm tra vai trò của quản trị viên (chỉ cho phép hệ thống admin và sub admin đăng nhập)
            if (existingAccount.role !== 'user') {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: messages.login.usernameAdminRole },
                    ...req.body,
                });
            }
            const decryptedPassword = CryptoService.decrypt(existingAccount.password);
            if (password !== decryptedPassword) {
                return res.render('Login', {
                    layout: 'Login&Register',
                    errors: {
                        password: messages.login.passwordCompaseFailed
                    },
                    ...req.body
                });
            }


            // Tạo JWT token cho người dùng sau khi đăng nhập thành công
            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: existingAccount._id, role: existingAccount.role }, jwtSecretKey, { expiresIn: '5h' });
            req.session.tokenUser = token;  // Lưu token vào session
            req.session.isLoggedInUser = true;  // Đánh dấu là đã đăng nhập

            // Truy vấn tất cả các khóa học và sử dụng populate để lấy thông tin tác giả
            const courses = await Courses.find().populate('author', 'profile');
                
            // Chuyển đổi dữ liệu khóa học để thêm tên tác giả
            const coursesData = courses.map(course => {
                const authorFullName = course.author && course.author.profile ? course.author.profile.fullName : 'Unknown';
                const authorImage = course.author && course.author.profile ? course.author.profile.avatar : 'Unknown';
                return {
                    ...course.toObject(),
                    author: authorFullName,
                    imageAuthor: authorImage
                };
            });

            res.render(
            'pages/home',
            { 
                tokenUser: req.session.tokenUser, 
                isLoggedInUser: req.session.isLoggedInUser, 
                currentYear: currentYear,
                courses: coursesData,
                dataUser: {
                    id: existingAccount._id,
                    fullName: existingAccount.profile.fullName,
                    avatar: existingAccount.profile.avatar ? existingAccount.profile.avatar : '/avatars/user.png',
                }
            });

        } catch (error) {
            return res.status(500).json({ error });

        }   
    }
}

module.exports = new Login();
