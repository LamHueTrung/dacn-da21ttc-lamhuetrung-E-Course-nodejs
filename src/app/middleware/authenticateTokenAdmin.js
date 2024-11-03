const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.session.token;

    if (!token) {
        return res.redirect('/admin');
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.redirect('/admin');
        }

        req.user = decoded; 
        next(); 
    });
};

module.exports = authenticateToken;
