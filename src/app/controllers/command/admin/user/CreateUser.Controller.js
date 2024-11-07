const Acount = require('../../../../model/admin/Acount');
const Validator = require('../../../../Extesions/validator');
const messages = require('../../../../Extesions/messCost');
const CryptoService = require('../../../../Extesions/cryptoService');

class CreateUser {
    Validate(req) {
        const {
            userName,
            fullName,
            birthday,
            specialty,
            numberPhone,
            address,
            role
        } = req.body;

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

        const userNameError =
            Validator.notEmpty(userName, 'User name') ||
            Validator.notNull(userName, 'User name') ||
            Validator.maxLength(userName, 50, 'User name') ||
            Validator.containsVietnamese(userName);
        if (userNameError) errors.userName = userNameError;

        const fullNameError =
            Validator.notEmpty(fullName, 'Họ và tên') ||
            Validator.notNull(fullName, 'Họ và tên') ||
            Validator.maxLength(fullName, 50, 'Họ và tên');
        if (fullNameError) errors.fullName = fullNameError;

        const birthdayError = Validator.isDate(birthday, 'Ngày sinh');
        if (birthdayError) errors.birthday = birthdayError;

        const specialtyError =
            Validator.notEmpty(specialty, 'Chuyên ngành') ||
            Validator.maxLength(specialty, 100, 'Chuyên ngành');
        if (specialtyError) errors.specialty = specialtyError;

        const numberPhoneError =
            Validator.notEmpty(numberPhone, 'Số điện thoại') ||
            Validator.isPhoneNumber(numberPhone);
        if (numberPhoneError) errors.numberPhone = numberPhoneError;

        const addressError = Validator.notEmpty(address, 'Địa chỉ');
        if (addressError) errors.address = addressError;

        if (req.file) {
            const avatarError =
                Validator.maxFileSize(req.file.size, 10, 'Ảnh đại diện'); 
            if (avatarError) errors.avatar = avatarError;
        } else {
            errors.avatar = messages.createUser.avartarRequried;
        }

        const roleError = Validator.isEnum(role, ['sub_admin', 'user'], 'Vai trò');
        if (roleError) errors.role = roleError;

        return errors;
    }

    Handle = async (req, res) => {
        const errors = this.Validate(req);
        const hasErrors = Object.values(errors).some(error => error !== '');
        if (hasErrors) {
            return res.render('pages/admin/addUser', {
                layout: 'admin',
                errors,
                userName: req.body.userName,
                fullName: req.body.fullName,
                birthday: req.body.birthday,
                specialty: req.body.specialty,
                numberPhone: req.body.numberPhone,
                address: req.body.address,
                role: req.body.role
            });
        }

        const { userName, fullName, birthday, specialty, numberPhone, address, role } = req.body;

        try {
            const existingAccount = await Acount.findOne({ username: userName });
            if (existingAccount) {
                return res.render('pages/admin/addUser', {
                    layout: 'admin',
                    errors: { userName: messages.createUser.accountExist },
                    userName,
                    fullName,
                    birthday,
                    specialty,
                    numberPhone,
                    address,
                    role
                });
            }

            const password = userName + "*"; 
            const encryptedPassword = CryptoService.encrypt(password); 
            req.session.isCreate = true;

            const newAccount = new Acount({
                username: userName,
                password: encryptedPassword,
                role: role,
                profile: {
                    fullName: fullName,
                    birthDate: new Date(birthday),
                    specialty: specialty,
                    avatar: req.file ? '/avatars/' + req.file.filename : null,
                    address: address,
                    phone: numberPhone,
                }
            });

            await newAccount.save();

            return res.render('pages/admin/addUser', {
                layout: 'admin',
                isCreate: req.session.isCreate
            });

        } catch (error) {
            console.error(messages.createUser.RegisterErorr, error);
            return res.status(500).json({ message: messages.serverError });

        } finally {
            delete req.session.isCreate;
        }
    }
}

module.exports = new CreateUser();
