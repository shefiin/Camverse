const express = require('express');
const router = express.Router();
const { renderReturnsInfoPage } = require('../../controllers/user/homeController');

router.get('/', renderReturnsInfoPage);

module.exports = router;
