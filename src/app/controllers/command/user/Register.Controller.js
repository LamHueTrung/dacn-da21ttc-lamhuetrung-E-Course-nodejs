const Acounts = require('../../../model/Acount');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
const currentYear = new Date().getFullYear();

/**
 * Class CreateUser
 * Chức năng: Xử lý tạo tài khoản người dùng mới cho quản trị viên
 * - Hàm `Validate`: Thực hiện kiểm tra dữ liệu đầu vào của người dùng.
 * - Hàm `Handle`: Kiểm tra dữ liệu và xử lý logic tạo người dùng mới.
 */
class Register {

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
            fullName,
            password,
            passwordCon
        } = req.body;

        // Khởi tạo đối tượng lưu lỗi cho từng trường
        let errors = {
            userName: '',
            fullName: '',
            password: '',
            passwordCon: '',
            
        };

        // Kiểm tra tính hợp lệ của tên người dùng
        const userNameError =
            Validator.notEmpty(userName, 'User name') ||
            Validator.notNull(userName, 'User name') ||
            Validator.maxLength(userName, 50, 'User name') ||
            Validator.containsVietnamese(userName);  // Kiểm tra tên có chứa ký tự tiếng Việt
        if (userNameError) errors.userName = userNameError;

        // Kiểm tra tính hợp lệ của họ và tên
        const fullNameError =
            Validator.notEmpty(fullName, 'Họ và tên') ||
            Validator.notNull(fullName, 'Họ và tên') ||
            Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;
        
        // Kiểm tra tính hợp lệ của mật khẩu
        const passwordError =
            Validator.notEmpty(password, 'Mật khẩu') ||
            Validator.notNull(password, 'Mật khẩu') ||
            Validator.isPassword(password)
        if (passwordError) errors.password = passwordError;

        // Kiểm tra tính hợp lệ của xác nhận mật khẩu
        const passwordConError =
            Validator.notEmpty(passwordCon, 'Xác nhận mật khẩu') ||
            Validator.notNull(passwordCon, 'Xác nhận mật khẩu') ||
            Validator.equals(password, passwordCon, 'Xác nhận mật khẩu');  // Kiểm tra mật khẩu và xác nhận có khớp không
        if (passwordConError) errors.passwordCon = passwordConError;

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
            return res.render('Register', {
                layout: 'Login&Register',
                errors,
                ...req.body,
                currentYear: currentYear
            });
        }

        // Lấy thông tin người dùng từ request body
        const { userName,
            fullName,
            password,
            passwordCon } = req.body;

        try {
            // Kiểm tra sự tồn tại của tên tài khoản
            const existingAccount = await Acounts.findOne({ username: userName });
            if (existingAccount) {
                return res.render('Register', {
                    layout: 'Login&Register',
                    errors: { userName: messages.createUser.accountExist },
                    ...req.body,
                    currentYear: currentYear
                });
            }

            // Tạo mã hóa mật khẩu
            const encryptedPassword = CryptoService.encrypt(password);  // Mã hóa mật khẩu
            req.session.isCreate = true;  // Đánh dấu là tài khoản mới đã được tạo

            // Tạo tài khoản mới với các thông tin đã cung cấp
            const newAccount = new Acounts({
                username: userName,
                password: encryptedPassword,
                role: 'user',
                profile: {
                    fullName: fullName,
                }
            });

            // Lưu tài khoản mới vào cơ sở dữ liệu
            await newAccount.save();

            // Hiển thị trang thêm người dùng kèm thông báo tạo thành công
            return res.render('Register', {
                layout: 'Login&Register',
                isCreate: req.session.isCreate,
                currentYear: currentYear
            });

        } catch (error) {
            // Ghi log lỗi và trả về thông báo lỗi khi xảy ra lỗi trong quá trình tạo tài khoản
            return res.status(500).json({ error });

        } finally {
            // Xóa session tạo tài khoản sau khi hoàn tất
            delete req.session.isCreate;
        }
    }
}

module.exports = new Register();
