class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.render('Login', { layout: 'Login&Register'});
    }

    // Render login page
    register(req, res) {
        res.render('Register', { layout: 'Login&Register'});
    }

    //Home pages
    index(req, res) {
        res.render('home');
    }
};

module.exports = new SitesQuery;