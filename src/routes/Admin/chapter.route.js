const express = require('express');
const router  = express.Router();
const CreateChapterCommand = require('../../app/controllers/command/admin/chapter/CreateChapter.Controller');
const DeleteChapterCommand = require('../../app/controllers/command/admin/chapter/DeleteChapter.Controller');
const UpdateCourseCommand = require('../../app/controllers/command/admin/course/UpdateCourse.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');
const upload = require('../../app/Extesions/uploadCourse');

// //Route view course
// router.use('/viewCourse/:id', authenticateToken, CourseQuery.viewsCourse);

//Route disable course
router.post('/disable/:id', authenticateToken, DeleteChapterCommand.disable);
router.post('/restore/:id', authenticateToken, DeleteChapterCommand.restore);

// Route delete course 
router.post('/delete/:id', authenticateToken, DeleteChapterCommand.delete);

// //Route Create Course 
// router.post('/addCourse', upload.single('thumbnail'), authenticateToken, (req, res) => {
//     CreateCourseCommand.Handle(req, res);
// });
// router.post('/clear-create-flag', authenticateToken, (req, res) => {
//     delete req.session.isCreate;
//     res.sendStatus(200);
// });
// router.get('/addCourse', authenticateToken, CourseQuery.addCourse);

// //Route update course
// router.post('/updateCourse/:id', upload.single('thumbnail'), authenticateToken, (req, res) => {
//     UpdateCourseCommand.Handle(req, res);
// });
// router.get('/updateCourse/:id', authenticateToken, CourseQuery.UpdateCourse);
// router.post('/clear-update-flag', authenticateToken, (req, res) => {
//     delete req.session.isUpdate;
//     res.sendStatus(200);
// });

router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});

module.exports = router;