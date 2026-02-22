const express = require('express');
const router = express.Router();
const { renderAboutPage } = require('../../controllers/user/homeController');

router.get('/', renderAboutPage);

module.exports = router;
