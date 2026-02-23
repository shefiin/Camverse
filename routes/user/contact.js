const express = require('express');
const router = express.Router();
const { renderContactPage } = require('../../controllers/user/homeController');

router.get('/', renderContactPage);

module.exports = router;
