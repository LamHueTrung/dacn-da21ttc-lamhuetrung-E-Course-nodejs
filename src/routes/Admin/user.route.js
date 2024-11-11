const express = require('express');
const router  = express.Router();
const CreateUserCommand = require('../../app/controllers/command/admin/user/CreateUser.Controller');
const UpdateUserCommand = require('../../app/controllers/command/admin/user/UpdateUser.Controller');
const DeleteUserCommand = require('../../app/controllers/command/admin/user/DeleteUser.Controller');
const UserQuery = require('../../app/controllers/query/admin/userQuery.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');
const upload = require('../../app/Extesions/uploadAvatar');

//Route add user
router.post('/addUser', upload.single('avatar'), authenticateToken, (req, res) => {
    CreateUserCommand.Handle(req, res);
});
router.use('/addUser', authenticateToken, UserQuery.AddUser);
router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});

// route profile user
router.use('/profile', authenticateToken, UserQuery.Profile);
router.post('/changPassword', authenticateToken, UpdateUserCommand.ChangePassword);

// Route List all user
router.use('/listAllUser', authenticateToken, UserQuery.ListAllUser);
router.use('/profiles/:id', UserQuery.ViewsProfileUser);
router.post('/disable/:id', authenticateToken, DeleteUserCommand.disable);
router.post('/restore/:id', authenticateToken, DeleteUserCommand.restore);

//Route update user
router.post('/updateUser/:id', upload.single('avatar'), authenticateToken, (req, res) => {
    UpdateUserCommand.Handle(req, res);
});
router.get('/updateUser/:id', authenticateToken, UserQuery.UpdateUser);
router.post('/clear-soft-update-flag', authenticateToken, (req, res) => {
    delete req.session.isUpdate;
    res.sendStatus(200);
});

//Route delete user
router.post('/delete/:id', authenticateToken, DeleteUserCommand.delete);
router.post('/clear-soft-delete-flag', authenticateToken, (req, res) => {
    delete req.session.isSoftDelete;
    res.sendStatus(200);
});

module.exports = router;