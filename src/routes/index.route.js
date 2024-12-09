const userRouter = require('./User/index');
const adminsRouter = require('./Admin/admin.route');
const session = require('express-session');
const passport = require('passport');
require('../app/Extesions/passport-config');

function Route(app) {
    app.use(session({
        secret: process.env.JWT_SECRET_KEY, 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    }));
    // Cấu hình passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        res.locals.isLoggedInUser = req.session.isLoggedInUser || false;
        res.locals.dataUser = req.session.dataUser || {};
        next();
    });
    app.use('/admin', adminsRouter);
    app.use('/', userRouter);
    

}


module.exports = Route;