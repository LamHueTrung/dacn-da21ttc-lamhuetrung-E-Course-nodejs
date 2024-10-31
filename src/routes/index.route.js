const sitesRouter = require('./sites.route');
const adminsRouter = require('./admin.route');

function Route(app) {
    app.use('/Admin', adminsRouter);
    app.use('/', sitesRouter);
}

module.exports = Route;