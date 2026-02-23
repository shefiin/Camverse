const express = require('express');
const router = express.Router();
const { renderRefundPolicyPage } = require('../../controllers/user/homeController');

router.get('/', renderRefundPolicyPage);

module.exports = router;
