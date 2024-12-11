const express = require('express');
const router  = express.Router();
const CourseQuery = require('../../app/controllers/query/user/courseQuery.Controller');
const CourseRegistrationCommand = require('../../app/controllers/command/user/course/Registration.Controller');
const CommentsCommand = require('../../app/controllers/command/user/course/Comment.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenUser');


router.use('/Learning/:idCourse/:idLesson', authenticateToken, (req, res) => CourseRegistrationCommand.Handle(req, res));
router.post('/clear-registrantion-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});
router.post('/clear-registrantion-error-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});

router.use('/:id', CourseQuery.homeCourse);

module.exports = router;    