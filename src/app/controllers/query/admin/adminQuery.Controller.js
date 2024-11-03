const jwt = require('jsonwebtoken');

class AdminQuery {
    //Logout pages
    Logout(req, res, next) {
        req.session.isLoggedIn = false;
        req.session.destroy(err => {
            if (err) {
                console.error('Failed to destroy session during logout:', err);
                return res.status(500).json({ message: 'Failed to logout' });
            }
    
            // Xóa cookie và trả về phản hồi
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
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