class HomeQuery {
    
    //Home pages
    index(req, res) {
        res.render('home');
    }
    
};

module.exports = new HomeQuery;