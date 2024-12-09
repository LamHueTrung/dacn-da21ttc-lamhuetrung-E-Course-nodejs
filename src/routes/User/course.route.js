const express = require('express');
const router  = express.Router();
const CourseQuery = require('../../app/controllers/query/user/courseQuery.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenUser');


//Route list all Courses & Chapters
router.use('/:id', (req, res) => CourseQuery.homeCourse(req, res));

module.exports = router;