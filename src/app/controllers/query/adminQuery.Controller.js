class AdminQuery {
    //Home pages
    index(req, res) {
        const currentYear = new Date().getFullYear();
        res.render('pages/admin/main', { layout: 'admin', year: currentYear});
    }
};

module.exports = new AdminQuery;