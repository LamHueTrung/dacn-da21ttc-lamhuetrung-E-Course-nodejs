const express = require('express');
const router  = express.Router();
const adminQuery = require('../../app/controllers/query/admin/adminQuery.Controller');
const adminCommand = require('../../app/controllers/command/admin/login.Controller');
const userRoute = require('./user.route');
const courseRoute = require('./course.route');
const lessonRoute = require('./lesson.route');
const chapterRoute = require('./chapter.route');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//Lesson route
router.use('/lesson', lessonRoute);

//Chapter route
router.use('/chapter', chapterRoute);

//Course route
router.use('/course', courseRoute);

//User route
router.use('/user', userRoute);

//Admin route
router.use('/home', authenticateToken, adminQuery.Index);
router.post('/logout', authenticateToken, adminQuery.Logout);
router.post('/', (req, res) => adminCommand.Handle(req, res));
router.use('/', adminQuery.Login);

module.exports = router;