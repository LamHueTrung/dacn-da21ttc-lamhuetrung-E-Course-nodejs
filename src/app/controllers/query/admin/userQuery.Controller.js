const Acounts = require('../../../model/Acount');
const CryptoService = require('../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const messages = require('../../../Extesions/messCost');

class UserQuery {
    
    /**
     * Hàm AddUser: Xử lý trang thêm người dùng mới.
     * - Trả về trang thêm người dùng với năm hiện tại và trạng thái tạo mới (nếu có).
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    AddUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/addUser', { layout: 'admin', year: currentYear, isCreate: req.session.isCreate });
    }

    /**
     * Hàm UpdateUser: Xử lý trang cập nhật thông tin người dùng.
     * - Tìm kiếm người dùng theo ID và trả về dữ liệu để hiển thị lên form.
     * - Nếu không tìm thấy người dùng, trả về lỗi 404.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    async UpdateUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        const userId = req.params.id;

        try {
            const admin = await Acounts.findById(userId);

            if (!admin) {
                return res.status(404).send(messages.token.tokenNotFound);  // Nếu không tìm thấy người dùng
            }

            res.render('pages/admin/updateUser', {
                layout: 'admin',
                year: currentYear,
                isUpdate: req.session.isUpdate,  // Trạng thái cập nhật người dùng
                data: {
                    id: admin._id,
                    username: admin.username,
                    role: admin.role,
                    fullName: admin.profile.fullName,
                    birthDate: admin.profile.birthDate,
                    specialty: admin.profile.specialty,
                    avatar: admin.profile.avatar,
                    address: admin.profile.address,
                    phone: admin.profile.phone,
                }
            });
        } catch (error) {
            console.error(messages.token.tokenFetchingError, error);
            res.status(500).send('Internal Server Error');  // Trả về lỗi server nếu có lỗi
        }
    }

    /**
     * Hàm Profile: Xử lý trang hồ sơ người dùng.
     * - Lấy thông tin người dùng từ token và trả về trang hồ sơ.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    Profile(req, res, next) {
        const currentYear = new Date().getFullYear();
        const token = req.session.token;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            if (err) {
                console.error(messages.token.tokenVerificationFailed, err);  // Nếu token không hợp lệ
            }

            req.userId = decoded.id;  // Gán userId vào request từ decoded token

            Acounts.findById(req.userId)
                .then(admin => {
                    if (!admin) {
                        return res.status(404).send('Admin not found');  // Nếu không tìm thấy người dùng
                    }

                    res.render('pages/admin/profile', {
                        layout: 'admin',
                        data: {
                            role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',  // Xử lý hiển thị role
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                        },
                        year: currentYear
                    });
                })
                .catch(error => {
                    console.error(messages.token.tokenFetchingError, error);
                    res.status(500).send('Internal Server Error');  // Trả về lỗi server nếu có lỗi khi lấy thông tin người dùng
                });
        });
    }

    /**
     * Hàm ListAllUser: Xử lý trang danh sách tất cả người dùng.
     * - Lấy tất cả các tài khoản ngoại trừ "system_admin".
     * - Nếu không có người dùng, trả về trang danh sách người dùng rỗng.
     * - Mã hóa mật khẩu người dùng trước khi gửi dữ liệu.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    async ListAllUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        try {
            const accounts = await Acounts.find({ role: { $ne: 'system_admin' }});

            if (accounts.length === 0) {
                return res.render('pages/admin/listAllUser', {
                    layout: 'admin',
                    year: currentYear,
                    isSoftDelete: req.session.isSoftDelete  // Trạng thái xóa mềm
                });
            }

            // Mã hóa mật khẩu người dùng trước khi hiển thị
            const accountData = accounts.map(account => ({
                ...account.toObject(),
                passwordDecrypted: CryptoService.decrypt(account.password)  // Giải mã mật khẩu
            }));

            res.render('pages/admin/listAllUser', { 
                layout: 'admin', 
                year: currentYear,
                isDeleted: req.session.isDeleted,  // Trạng thái xóa người dùng
                accounts: accountData,  // Dữ liệu người dùng đã mã hóa mật khẩu
                isSoftDelete: req.session.isSoftDelete
            });
        } catch (error) {
            console.error(messages.getAllUser.getAllUserError, error);
            res.status(500).send('Internal Server Error');  // Trả về lỗi server nếu có lỗi
        }
    }

    /**
     * Hàm ViewsProfileUser: Xử lý trang hồ sơ người dùng khi xem thông tin người khác.
     * - Trả về thông tin người dùng cụ thể theo ID.
     * @param {Object} req - Request từ client
     * @param {Object} res - Response trả về cho client
     * @param {Function} next - Hàm tiếp theo trong chuỗi middleware
     */
    ViewsProfileUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        const userId = req.params.id;  // Lấy ID người dùng từ params
        Acounts.findById(userId)
            .then(admin => {
                if (!admin) {
                    return res.status(404).send(messages.token.tokenNotFound);  // Nếu không tìm thấy người dùng
                }

                res.render('pages/admin/profile', {
                    layout: 'admin',
                    data: {
                        role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : admin.role == 'sub_admin' ? 'SUB ADMIN' : 'USER',  // Xử lý hiển thị role
                        fullName: admin.profile.fullName,
                        birthDate: admin.profile.birthDate,
                        specialty: admin.profile.specialty,
                        avatar: admin.profile.avatar,
                        address: admin.profile.address,
                        phone: admin.profile.phone,
                    },
                    year: currentYear
                });
            })
            .catch(error => {
                console.error(messages.token.tokenFetchingError, error);
                res.status(500).send('Internal Server Error');  // Trả về lỗi server nếu có lỗi khi lấy thông tin người dùng
            });
    }
}

module.exports = new UserQuery;
