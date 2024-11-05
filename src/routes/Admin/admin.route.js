const express = require('express');
const router  = express.Router();
const adminQuery = require('../../app/controllers/query/admin/adminQuery.Controller');
const adminCommand = require('../../app/controllers/command/admin/login.Controller');

const userRoute = require('./user.route');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//user route
router.use('/user', userRoute);

// admin route
router.use('/home', authenticateToken, adminQuery.Index);
router.post('/logout', adminQuery.Logout);
router.post('/', (req, res) => adminCommand.Handle(req, res));
router.use('/', adminQuery.Login);

module.exports = router;