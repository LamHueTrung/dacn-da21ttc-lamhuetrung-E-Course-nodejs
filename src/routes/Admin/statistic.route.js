const express = require('express');
const router  = express.Router();
const StatisticQuery = require('../../app/controllers/query/admin/statisticQuery.Controller');
const StatisticUserCommand = require('../../app/controllers/command/admin/statistic/User.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//Route view user

router.get('/users/overview', (req, res) => StatisticUserCommand.Overview(req, res));
router.get('/users/registration/timeline', (req, res) => StatisticUserCommand.Registration(req, res));

router.use('/users', (req, res) => StatisticQuery.StatisticsUser(req, res));
module.exports = router;