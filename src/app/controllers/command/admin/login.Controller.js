const Acount = require('../../../model/admin/Acount');
const Validator = require('../../../Extesions/validator');
const messages = require('../../../Extesions/messCost');
const CryptoService = require('../../../Extesions/cryptoService');
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
    }

    Handle = async (req, res) => {
        const currentYear = new Date().getFullYear();
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
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: {
                        username: messages.login.usernameNotFound
                    },
                    username,
                    password
                });
            }

            if (admin.isDeleted) {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: messages.login.usernamesoftDelete },
                    username,
                    password
                });
            }

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

            if (admin.role !== 'system_admin' && admin.role !== 'sub_admin') {
                return res.render('LoginAdmin', {
                    layout: 'Login&Register',
                    errors: { username: messages.login.usernameNotRole },
                    username,
                    password
                });
            }

            const jwtSecretKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ id: admin._id, role: admin.role }, jwtSecretKey, { expiresIn: '1h' });
            req.session.token = token;
            req.session.isLoggedIn = true;

            return res.render('pages/admin/main', { layout: 'admin', token: token, isLoggedIn: req.session.isLoggedIn, currentYear: currentYear });
        } catch (error) {
            console.error(messages.login.loginError, error);
            return res.status(500).json({ message: messages.serverError });
        }
    }
}

module.exports = new LoginAdmin();
