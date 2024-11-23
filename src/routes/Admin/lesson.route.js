const express = require('express');
const router  = express.Router();
const LessonQuery = require('../../app/controllers/query/admin/lessonQuery.Controller');
const CreateLessonCommand = require('../../app/controllers/command/admin/lesson/CreateLesson.Controller');
const DeleteLessonCommand = require('../../app/controllers/command/admin/lesson/DeleteLesson.Controller');
const UpdateLessonCommand = require('../../app/controllers/command/admin/lesson/UpdateLesson.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

// //Route view course
// router.use('/viewCourse/:id', authenticateToken, CourseQuery.viewsCourse);

// router.get('/addCourse', authenticateToken, CourseQuery.addCourse);


//Route Create lesson 
router.post('/addLesson/:id', authenticateToken, (req, res) => {
    CreateLessonCommand.Handle(req, res);
});
router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});
router.use('/addLesson/:id', authenticateToken, LessonQuery.addLesson);

//Route disable lesson
router.post('/disable/:id', authenticateToken, DeleteLessonCommand.disable);
router.post('/restore/:id', authenticateToken, DeleteLessonCommand.restore);

// Route delete lesson 
router.post('/delete/:id', authenticateToken, DeleteLessonCommand.delete);

//Route update lesson
router.post('/updateLesson/:id', authenticateToken, (req, res) => {
    UpdateLessonCommand.Handle(req, res);
});
router.get('/updateLesson/:id', authenticateToken, LessonQuery.UpdateLesson);
router.post('/clear-update-flag', authenticateToken, (req, res) => {
    delete req.session.isUpdate;
    res.sendStatus(200);
});

//Route view lesson
router.use('/viewLesson/:id', authenticateToken, LessonQuery.viewsLesson);
module.exports = router;