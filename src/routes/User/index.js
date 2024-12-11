const express = require('express');
const router  = express.Router();
const authenticateToken = require('../../app/middleware/authenticateTokenUser');
const course = require('./course.route');
const loginGG = require('./loginGoogle.route');
const user = require('./user.route');
const userQuery = require('../../app/controllers/query/user/userQuery.Controller');
const coursesQuery = require('../../app/controllers/query/user/courseQuery.Controller');

//Course route
router.use('/Course', course);

//Login route
router.use('/LoginGoogle', loginGG);

//User route 
router.use('/User', user);

router.use('/Detail', userQuery.detailBlog);
router.use('/Blog', userQuery.homeBlog);
router.use('/', coursesQuery.index);



module.exports = router;