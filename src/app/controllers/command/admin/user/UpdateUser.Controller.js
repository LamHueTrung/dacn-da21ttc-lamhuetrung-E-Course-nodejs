const Acount = require('../../../../model/admin/Acount');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const CryptoService = require('../../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');

class UpdateUser {
    async ChangePassword(req, res) {
        const currentYear = new Date().getFullYear();
        const token = req.session.token;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const {
            passwordOld,
            passwordNew
        } = req.body;

        let errors = {
            passwordOld: '',
            passwordNew: ''
        };

        const passwordOldError = 
            Validator.notEmpty(passwordOld, 'password') ||
            Validator.notNull(passwordOld, 'password') ||
            Validator.isPassword(passwordOld);
        if (passwordOldError) errors.passwordOld = passwordOldError;

        const passwordNewError = 
            Validator.notEmpty(passwordNew, 'password') ||
            Validator.notNull(passwordNew, 'password') ||
            Validator.isPassword(passwordNew);
        if (passwordNewError) errors.passwordNew = passwordNewError;

        // Verify the JWT token
        jwt.verify(token, jwtSecretKey, async (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(401).send('Unauthorized');
            }

            req.userId = decoded.id; 

            try {
                const admin = await Acount.findById(req.userId);
                if (!admin) {
                    return res.status(404).send('Admin not found'); 
                }

                const hasErrors = Object.values(errors).some(error => error !== '');
                if (hasErrors) {
                    return res.render('pages/admin/profile', {
                        layout: 'admin',
                        errors,
                        passwordOld: req.body.passwordOld,
                        passwordNew: req.body.passwordNew,
                        data: {
                            role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                        },
                        year: currentYear
                    });
                } 

                // Decrypt the stored password
                const decryptedPassword = CryptoService.decrypt(admin.password);
                if (passwordOld !== decryptedPassword) {
                    errors.passwordOld = 'Mật khẩu không chính xác';
                    return res.render('pages/admin/profile', {
                        layout: 'admin',
                        errors,
                        passwordOld,
                        passwordNew,
                        data: {
                            role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                        },
                        year: currentYear
                    });
                }

                // Encrypt the new password
                const encryptedPassword = CryptoService.encrypt(passwordNew);
                admin.password = encryptedPassword;
                await admin.save();
                req.session.isChangePassword = true;

                return res.render('pages/admin/profile', {
                    layout: 'admin',
                    data: {
                        role: admin.role === 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                        fullName: admin.profile.fullName,
                        birthDate: admin.profile.birthDate,
                        specialty: admin.profile.specialty,
                        avatar: admin.profile.avatar,
                        address: admin.profile.address,
                        phone: admin.profile.phone,
                    },
                    year: currentYear,
                    isChangePassword: req.session.isChangePassword
                });
                
            } catch (error) {
                console.error('Lỗi khi xử lý thay đổi mật khẩu:', error);
                return res.status(500).json({ message: messages.serverError });
            }
        });
    }
}

module.exports = new UpdateUser();
