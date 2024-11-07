const sitesRouter = require('./sites.route');
const adminsRouter = require('./Admin/admin.route');
const session = require('express-session');

function Route(app) {
    app.use(session({
        secret: process.env.JWT_SECRET_KEY, 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    }));
    app.use('/admin', adminsRouter);
    app.use('/', sitesRouter);
    
}


module.exports = Route;