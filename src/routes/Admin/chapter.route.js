const express = require('express');
const router  = express.Router();
const DeleteChapterCommand = require('../../app/controllers/command/admin/chapter/DeleteChapter.Controller');
const LessonsQuery = require('../../app/controllers/query/admin/lessonQuery.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//Route disable course
router.post('/disable/:id', authenticateToken, DeleteChapterCommand.disable);
router.post('/restore/:id', authenticateToken, DeleteChapterCommand.restore);

// Route delete course 
router.post('/delete/:id', authenticateToken, DeleteChapterCommand.delete);

router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});

router.post('/clear-update-flag', authenticateToken, (req, res) => {
    delete req.session.isUpdate;
    res.sendStatus(200);
});

router.get('/listAllLesson/:id', authenticateToken, LessonsQuery.listAllLesson);

module.exports = router;