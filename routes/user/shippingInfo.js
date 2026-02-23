const express = require('express');
const router = express.Router();
const { renderShippingInfoPage } = require('../../controllers/user/homeController');

router.get('/', renderShippingInfoPage);

module.exports = router;
