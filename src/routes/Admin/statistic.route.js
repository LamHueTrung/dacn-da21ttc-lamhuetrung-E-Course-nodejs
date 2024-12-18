const express = require('express');
const router  = express.Router();
const StatisticQuery = require('../../app/controllers/query/admin/statisticQuery.Controller');
const StatisticUserCommand = require('../../app/controllers/command/admin/statistic/User.Controller');
const StatisticCourseCommand = require('../../app/controllers/command/admin/statistic/Course.Controller');

//Route course
router.use('/courses/registrations', (req, res) => StatisticCourseCommand.Registrations(req, res));
router.use('/courses/progress', (req, res) => StatisticCourseCommand.Progress(req, res));
router.use('/courses/course-duration', (req, res) => StatisticCourseCommand.CourseDuration(req, res));
router.use('/courses/authors', (req, res) => StatisticCourseCommand.Authors(req, res));
router.use('/courses', (req, res) => StatisticQuery.StatisticCourse(req, res));

//Route user
router.get('/users/overview', (req, res) => StatisticUserCommand.Overview(req, res));
router.get('/users/registration/timeline', (req, res) => StatisticUserCommand.Registration(req, res));

router.use('/users', (req, res) => StatisticQuery.StatisticsUser(req, res));
module.exports = router;