const jwt = require('jsonwebtoken');
const messages = require('../../../Extesions/messCost');
class AdminQuery {
    //Logout pages
    Logout(req, res, next) {
        req.session.isLoggedIn = false;
        req.session.isChangePassword = false;
        req.session.destroy(err => {
            if (err) {
                console.error(messages.session.sessionDestroyFailed, err);
                return res.status(500).json({ message: messages.session.sessionDestroyFailed });
            }
    
            res.clearCookie('connect.sid');
            res.status(200).json({ message: messages.session.sessionDestroySucces});
        });
    }

    //Login pages
    Login(req, res, next) {
        const token = req.session.token;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (!err) {
                    return res.redirect('/admin/home');
                }
            });
        }

        res.render('LoginAdmin', { layout: 'Login&Register' });
    }

    //Home pages
    Index(req, res, next) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/main', { layout: 'admin', year: currentYear, token: req.session.token, isLoggedIn: req.session.isLoggedIn });
    }
};

module.exports = new AdminQuery;