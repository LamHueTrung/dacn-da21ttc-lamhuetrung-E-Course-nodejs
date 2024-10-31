const express = require('express');
const router  = express.Router();
const adminQuery = require('../app/controllers/query/adminQuery.Controller');

router.use('/', adminQuery.index);

module.exports = router;