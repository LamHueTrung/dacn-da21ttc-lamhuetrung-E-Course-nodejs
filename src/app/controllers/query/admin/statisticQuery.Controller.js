class Statistic {
    StatisticsUser = async (req, res, next) => {
        res.render('pages/admin/statisticsUser', { layout: 'admin' });
    }
}

module.exports = new Statistic();
