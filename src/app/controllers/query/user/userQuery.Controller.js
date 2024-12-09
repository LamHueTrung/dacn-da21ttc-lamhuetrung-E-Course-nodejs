const Courses = require('../../../model/Course');
const currentYear = new Date().getFullYear();

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
    detailBlog(req, res) {
        res.render('pages/blogs/detail');
    }

    // Home blog pages
    homeBlog(req, res) {
        res.render('pages/blogs/home');
    }

};

module.exports = new SitesQuery;