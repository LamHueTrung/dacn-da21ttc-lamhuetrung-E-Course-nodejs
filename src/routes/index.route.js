const sitesRouter = require('./sites.route');

function Route(app) {
    app.use('/', sitesRouter);
}

module.exports = Route;