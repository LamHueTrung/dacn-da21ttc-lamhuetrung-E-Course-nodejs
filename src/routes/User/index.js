const express = require('express');
const router  = express.Router();
const authenticateToken = require('../../app/middleware/authenticateTokenUser');
const course = require('./course.route');
const loginGG = require('./loginGoogle.route');
const user = require('./user.route');
const searchQuery = require('../../app/controllers/query/user/Search.Controller');
const userQuery = require('../../app/controllers/query/user/userQuery.Controller');
const coursesQuery = require('../../app/controllers/query/user/courseQuery.Controller');
const trackVisits = require('../../app/middleware/trackVisits');

//Course route
router.use('/Course', course);

//Login route
router.use('/LoginGoogle', loginGG);

//User route 
router.use('/User', user);

//Search route 
router.use('/Search', (req, res) => searchQuery.Handle(req, res));

//Learning path route
router.use('/LearningPath/learningFrontendAndDevelopment', coursesQuery.pathFrontend);
router.use('/LearningPath/learningBackendAndDevelopment', coursesQuery.pathBackend);
router.use('/LearningPath', coursesQuery.learningPath);

router.use('/Detail', userQuery.detailBlog);
router.use('/Blog', userQuery.homeBlog);

router.use('/', trackVisits, coursesQuery.index);



module.exports = router;