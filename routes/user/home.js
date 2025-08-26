const express = require('express');
const router = express.Router();
const { renderHomePage } = require('../../controllers/user/homeController');

router.get('/',  renderHomePage);


module.exports = router;