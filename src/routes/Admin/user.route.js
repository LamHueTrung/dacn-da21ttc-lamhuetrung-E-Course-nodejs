const express = require('express');
const router  = express.Router();
const CreateUserCommand = require('../../app/controllers/command/admin/user/CreateUser.Controller');
const updateUserCommand = require('../../app/controllers/command/admin/user/UpdateUser.Controller');
const UserQuery = require('../../app/controllers/query/admin/userQuery.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');
const upload = require('../../app/Extesions/upload');


//Route add user
router.post('/addUser', upload.single('avatar'), (req, res) => {
    CreateUserCommand.Handle(req, res);
});
router.use('/addUser', authenticateToken, UserQuery.AddUser);


router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});

// route profile user
router.use('/profiles', authenticateToken, UserQuery.Profile);
router.post('/changPassword', authenticateToken, updateUserCommand.ChangePassword);

// Route List all user
router.use('/listAllUser', authenticateToken, UserQuery.ListAllUser);
router.use('/profiles/:id', UserQuery.ViewsProfileUser);

module.exports = router;