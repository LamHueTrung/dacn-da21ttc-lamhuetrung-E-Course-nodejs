const Acounts = require('../../../../model/Acount');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const CryptoService = require('../../../../Extesions/cryptoService');
const currentYear = new Date().getFullYear();

/**
 * Class CreateUser
 * Chức năng: Xử lý tạo tài khoản người dùng mới cho quản trị viên
 * - Hàm `Validate`: Thực hiện kiểm tra dữ liệu đầu vào của người dùng.
 * - Hàm `Handle`: Kiểm tra dữ liệu và xử lý logic tạo người dùng mới.
 */
class CreateUser {

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
            birthday,
            specialty,
            numberPhone,
            address,
            role
        } = req.body;

        // Khởi tạo đối tượng lưu lỗi cho từng trường
        let errors = {
            userName: '',
            fullName: '',
            birthday: '',
            specialty: '',
            numberPhone: '',
            address: '',
            avatar: '',
            role: ''
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

        // Kiểm tra định dạng ngày sinh
        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        // Kiểm tra tính hợp lệ của chuyên ngành
        const specialtyError =
            Validator.notEmpty(specialty, 'Chuyên ngành') ||
            Validator.maxLength(specialty, 100, 'Chuyên ngành');
        if (specialtyError) errors.specialty = specialtyError;

        // Kiểm tra tính hợp lệ của số điện thoại
        const numberPhoneError =
            Validator.notEmpty(numberPhone, 'Số điện thoại') ||
            Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

        // Kiểm tra tính hợp lệ của địa chỉ
        const addressError = Validator.notEmpty(address, 'Địa chỉ');
        if (addressError) errors.address = addressError;

        // Kiểm tra tính hợp lệ của ảnh đại diện
        if (req.file) {
            const avatarError =
                Validator.maxFileSize(req.file.size, 10, 'Ảnh đại diện');  // Kiểm tra kích thước file
            if (avatarError) errors.avatar = avatarError;
        } else {
            errors.avatar = messages.createUser.avatarRequired;
        }

        // Kiểm tra tính hợp lệ của vai trò
        const roleError = Validator.isEnum(role, ['sub_admin', 'user'], 'Vai trò');
        if (roleError) errors.role = roleError;

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
            return res.render('pages/admin/addUser', {
                layout: 'admin',
                errors,
                ...req.body,
                currentYear: currentYear
            });
        }

        // Lấy thông tin người dùng từ request body
        const { userName, fullName, birthday, specialty, numberPhone, address, role } = req.body;

        try {
            // Kiểm tra sự tồn tại của tên tài khoản
            const existingAccount = await Acounts.findOne({ username: userName });
            if (existingAccount) {
                return res.render('pages/admin/addUser', {
                    layout: 'admin',
                    errors: { userName: messages.createUser.accountExist },
                    ...req.body,
                    currentYear: currentYear
                });
            }

            // Tạo mật khẩu mặc định và mã hóa mật khẩu
            const password = userName + "*";  // Định nghĩa mật khẩu mặc định
            const encryptedPassword = CryptoService.encrypt(password);  // Mã hóa mật khẩu
            req.session.isCreate = true;  // Đánh dấu là tài khoản mới đã được tạo

            // Tạo tài khoản mới với các thông tin đã cung cấp
            const newAccount = new Acounts({
                username: userName,
                password: encryptedPassword,
                role: role,
                profile: {
                    fullName: fullName,
                    birthDate: new Date(birthday),
                    specialty: specialty,
                    avatar: req.file ? '/avatars/' + req.file.filename : null,  // Đường dẫn tới ảnh đại diện
                    address: address,
                    phone: numberPhone,
                }
            });

            // Lưu tài khoản mới vào cơ sở dữ liệu
            await newAccount.save();

            // Hiển thị trang thêm người dùng kèm thông báo tạo thành công
            return res.render('pages/admin/addUser', {
                layout: 'admin',
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

module.exports = new CreateUser();
