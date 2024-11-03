const Acount = require('../../../model/admin/Acount');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

class LoginAdmin {
    Validate(req) {
        const { username, password } = req.body;
        let errors = {
            username: '',
            password: ''
        };

        const usernameError = Validator.notEmpty(username, 'Tên đăng nhập');
        if (usernameError) errors.username = usernameError;

        const passwordError = Validator.notEmpty(password, 'Mật khẩu');
        if (passwordError) errors.password = passwordError;

        const passwordValidation = Validator.isPassword(password);
        if (passwordValidation) errors.password = passwordValidation;

        const vietnameseCheck = Validator.containsVietnamese(username);
        if (vietnameseCheck) errors.username = vietnameseCheck;

        return errors;

    };

    Handle = async (req, res) => {   
        const errors = this.Validate(req); 

        if (errors.username || errors.password) {
            return res.render('LoginAdmin', {
                layout: 'Login&Register',
                errors,
                username: req.body.username,
                password: req.body.password
            });
        } 
        const { username, password } = req.body;    

        try {
            const admin = await Acount.findOne({ username });
            if (!admin) {
                return res.status(401).json({ message: messages.login.invalidCredentials });
            }

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: {
                        password: 'Mật khẩu không chính xác'
                    },
                    username: req.body.username,
                    password: req.body.password
                });
                return res.status(401).json({ message: messages.login.invalidCredentials });
            }

            if (admin.role !== 'system_admin' && admin.role !== 'sub_admin') {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: 'Tài khoản không có quyền truy cập' },
                    username,
                    password
                });
            }
            
            // Tạo token cho admin bằng JWT
            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: admin._id, role: admin.role }, jwtSecretKey, { expiresIn: '1h' });
            req.session.token = token;
            req.session.isLoggedIn = true; 

            // Chuyển đến trang Home
            return res.render('pages/admin/main', { layout: 'admin', token: token, isLoggedIn: req.session.isLoggedIn});
        } catch (error) {
            console.error('Lỗi khi xử lý đăng nhập:', error);
            return res.status(500).json({ message: messages.serverError });
        }
    }
}


module.exports = new LoginAdmin;