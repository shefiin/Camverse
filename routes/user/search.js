const express = require('express');
const router = express.Router();
const { loadShopPage } = require('../../controllers/user/shopController');


router.get('/', loadShopPage);

module.exports = router;
