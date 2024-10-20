const express = require('express');
const router  = express.Router();
const sitesQuerry = require('../app/controllers/query/SitesQuerry.Controller');

router.use('/', sitesQuerry.index);

module.exports = router;