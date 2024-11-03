const Acount = require('../../../../model/admin/Acount');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const bcrypt = require('bcrypt');
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
        
        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
            }

            req.userId = decoded.id; 

            Acount.findById(req.userId)
            .then(admin => {
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
                            role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
                            fullName: admin.profile.fullName,
                            birthDate: admin.profile.birthDate,
                            specialty: admin.profile.specialty,
                            avatar: admin.profile.avatar,
                            address: admin.profile.address,
                            phone: admin.profile.phone,
                            }
                            , year: currentYear
                    });
                } 
            })
            .catch(error => {
                console.error('Error fetching admin data:', error);
                res.status(500).send('Internal Server Error'); 
            });
        });
        
        try {
            const admin = await Acount.findById(req.userId);
            const isMatch = await bcrypt.compare(passwordOld, admin.password);
            if (!isMatch) {
                errors.passwordOld = 'Mật khẩu không chính xác';
                return res.render('pages/admin/profile', {
                    layout: 'admin',
                    errors,
                    passwordOld,
                    passwordNew,
                    data: {
                        role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
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

            const hashedPassword = await bcrypt.hash(passwordNew, 12);
            admin.password = hashedPassword;
            await admin.save();
            req.session.isChangePassword = true;

            return res.render('pages/admin/profile', {
                layout: 'admin',
                data: {
                    role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : 'SUB ADMIN',
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
        
    }

}

module.exports = new UpdateUser;