const express = require('express');
const router = express.Router();
const { renderCouponPage, addCoupon } = require('../../controllers/admin/couponController');


router.get('/', renderCouponPage);

router.post('/add', addCoupon);


module.exports = router;