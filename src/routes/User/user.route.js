const express = require('express');
const router  = express.Router();
const userQuery = require('../../app/controllers/query/user/userQuery.Controller');
const RegisterCommand = require('../../app/controllers/command/user/Register.Controller');
const LoginCommand = require('../../app/controllers/command/user/Login.Controller');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');
const upload = require('../../app/Extesions/uploadAvatar');

router.post('/Login', (req, res) => {
    LoginCommand.Handle(req, res);
});
router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});
router.use('/Login', userQuery.login);



router.post('/Register', (req, res) => {
    RegisterCommand.Handle(req, res);
});
router.use('/Register', userQuery.register);
router.post('/clear-create-flag', authenticateToken, (req, res) => {
    delete req.session.isCreate;
    res.sendStatus(200);
});
module.exports = router;