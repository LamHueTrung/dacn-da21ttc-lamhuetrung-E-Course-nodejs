const express = require('express');
const router  = express.Router();
const adminQuery = require('../../app/controllers/query/admin/adminQuery.Controller');
const adminCommand = require('../../app/controllers/command/admin/login.Controller');
const userRoute = require('./user.route');
const courseRoute = require('./course.route');
const authenticateToken = require('../../app/middleware/authenticateTokenAdmin');

//course route
router.use('/course', courseRoute);

//user route
router.use('/user', userRoute);

// admin route
router.use('/home', authenticateToken, adminQuery.Index);
router.post('/logout', authenticateToken, adminQuery.Logout);
router.post('/', (req, res) => adminCommand.Handle(req, res));
router.use('/', adminQuery.Login);

module.exports = router;