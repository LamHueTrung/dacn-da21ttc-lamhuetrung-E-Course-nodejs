class Statistic {
    StatisticsUser = async (req, res, next) => {
        res.render('pages/admin/statisticsUser', { layout: 'admin' });
    }

    StatisticCourse = async (req, res, next) => {
        res.render('pages/admin/statisticsCourse', { layout: 'admin' });
    }
}

module.exports = new Statistic();
