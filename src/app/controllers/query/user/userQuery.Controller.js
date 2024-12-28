const currentYear = new Date().getFullYear();
const jwt = require('jsonwebtoken');
const Acounts = require('../../../model/Acount');


class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.render('Login', { layout: 'Login&Register'});
    }

    // Render login page
    register(req, res) {
        res.render('Register', { layout: 'Login&Register'});
    }

    // Details blog page
    async detailBlog(req, res) {
        if(req.session.tokenUser) {
            let IdUser = '';
            jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.redirect('/User/Login');
                }
                
                IdUser= decoded.id; 
            });
            const User = await Acounts.findOne({ _id: IdUser });
            res.render('pages/blogs/detail', {dataUser: {
                id: User._id,
                fullName: User.profile.fullName,
                avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
            }});
        }
        res.render('pages/blogs/detail');
    }

    // Home blog pages
    async homeBlog(req, res) {
        if(req.session.tokenUser) {
            let IdUser = '';
            jwt.verify(req.session.tokenUser, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.redirect('/User/Login');
                }
                
                IdUser= decoded.id; 
            });
            const User = await Acounts.findOne({ _id: IdUser });
            res.render('pages/blogs/home', {dataUser: {
                id: User._id,
                fullName: User.profile.fullName,
                avatar: User.profile.avatar ? User.profile.avatar : '/avatars/user.png',
            }});
        }
        res.render('pages/blogs/home');
    }

};

module.exports = new SitesQuery;