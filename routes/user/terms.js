const express = require('express');
const router = express.Router();
const { renderTermsPage } = require('../../controllers/user/homeController');

router.get('/', renderTermsPage);

module.exports = router;
