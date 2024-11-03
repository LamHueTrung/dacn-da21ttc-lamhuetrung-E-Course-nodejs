const express = require('express');
const router  = express.Router();
const CreateUserCommand = require('../../app/controllers/command/admin/user/CreateUser.Controller');
const updateUserCommand = require('../../app/controllers/command/admin/user/UpdateUser.Controller');
const UserQuery = require('../../app/controllers/query/admin/userQuery.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');
const upload = require('../../app/Extesions/upload');

router.post('/addUser', upload.single('avatar'), authenticateToken, (req, res) => {
    CreateUserCommand.Handle(req, res);
});
router.post('/admin/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});
router.post('/changPassword', authenticateToken, updateUserCommand.ChangePassword);
router.use('/addUser', authenticateToken, UserQuery.AddUser);
router.use('/profiles', authenticateToken, UserQuery.Profile);

module.exports = router;