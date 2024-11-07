const Acount = require('../../../model/admin/Acount');
const CryptoService = require('../../../Extesions/cryptoService');
const jwt = require('jsonwebtoken');
const messages = require('../../../Extesions/messCost');

class UserQuery {
    //User pages
    AddUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/addUser', {layout: 'admin', year: currentYear, isCreate: req.session.isCreate});
    }

    async UpdateUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        const userId = req.params.id;

        try {
            const admin = await Acount.findById(userId);

            if (!admin) {
                return res.status(404).send(messages.token.tokenNotFound);
            }

            res.render('pages/admin/updateUser', {
                layout: 'admin',
                year: currentYear,
                isUpdate: req.session.isUpdate,
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
            res.status(500).send('Internal Server Error');
        }
    }

    //Profile pages
    Profile(req, res, next) {
        const currentYear = new Date().getFullYear();
        const token = req.session.token;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            if (err) {
                console.error(messages.token.tokenVerificationFailed, err);
            }

            req.userId = decoded.id; 

            Acount.findById(req.userId)
            .then(admin => {
                if (!admin) {
                    return res.status(404).send('Admin not found'); 
                }

                res.render('pages/admin/profile', {
                    layout: 'admin',
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
            })
            .catch(error => {
                console.error(messages.token.tokenFetchingError, error);
                res.status(500).send('Internal Server Error'); 
            });
        });
    }

    // List all user pages
    async ListAllUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        try {
            const accounts = await Acount.find({ role: { $ne: 'system_admin' }});

            if (accounts.length === 0) {
                return res.render('pages/admin/listAllUser', {
                    layout: 'admin',
                    year: currentYear,
                    isSoftDelete: req.session.isSoftDelete
                });
            }

            const accountData = accounts.map(account => ({
                ...account.toObject(),
                passwordDecrypted: CryptoService.decrypt(account.password) 
            }));

            res.render('pages/admin/listAllUser', { 
                layout: 'admin', 
                year: currentYear,
                isDeleted: req.session.isDeleted,
                accounts: accountData, 
                isSoftDelete: req.session.isSoftDelete
            });
        } catch (error) {
            console.error(messages.getAllUser.getAllUserError, error);
            res.status(500).send('Internal Server Error');
        }
    }

    ViewsProfileUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        const userId = req.params.id; 
        Acount.findById(userId)
        .then(admin => {
            if (!admin) {
                return res.status(404).send(messages.token.tokenNotFound); 
            }
    
            res.render('pages/admin/profile', {
                layout: 'admin',
                data: {
                    role: admin.role == 'system_admin' ? 'SYSTEM ADMIN' : admin.role == 'sub_admin'? 'SUB ADMIN' : 'USER',
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
            res.status(500).send('Internal Server Error'); 
        });
    }


}

module.exports = new UserQuery;