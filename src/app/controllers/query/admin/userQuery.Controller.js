const Acount = require('../../../model/admin/Acount');
const jwt = require('jsonwebtoken');

class UserQuery {
    //User pages
    AddUser(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/addUser', {layout: 'admin', year: currentYear, isCreate: req.session.isCreate});
    }
    //Profile pages
    Profile(req, res, next) {
        const currentYear = new Date().getFullYear();
        const token = req.session.token;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        // Giải mã token để lấy thông tin người dùng
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
                console.error('Error fetching admin data:', error);
                res.status(500).send('Internal Server Error'); 
            });
        });
    }
}

module.exports = new UserQuery;