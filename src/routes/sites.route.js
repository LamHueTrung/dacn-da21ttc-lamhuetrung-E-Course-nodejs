const express = require('express');
const router  = express.Router();
const sitesQuery = require('../app/controllers/query/SitesQuery.Controller');

router.use('/Learning', sitesQuery.learningCourse);
router.use('/Course', sitesQuery.homeCourse);
router.use('/Register', sitesQuery.register);
router.use('/Login', sitesQuery.login);
router.use('/', sitesQuery.index);

module.exports = router;