class SitesQuery {
    
    // Render login page
    login(req, res) {
        res.render('Login', { layout: 'Login&Register'});
    }

    // Render login page
    register(req, res) {
        res.render('Register', { layout: 'Login&Register'});
    }

    //Home course pages
    learningCourse(req, res) {
        res.render('pages/courses/learning', { layout: 'learing'});
    }

    //Home course pages
    homeCourse(req, res) {
        res.render('pages/courses/home');
    }
    //Home pages
    index(req, res) {
        res.render('pages/home');
    }
};

module.exports = new SitesQuery;