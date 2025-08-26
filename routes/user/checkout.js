const express = require('express');
const { RenderCheckout } = require('../../controllers/user/checkoutController');
const router = express.Router();


router.get('/', RenderCheckout);


module.exports = router;
