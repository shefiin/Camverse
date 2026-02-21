const express = require('express');
const router = express.Router();
const { renderCouponPage, addCoupon, editCoupon, deleteCoupon } = require('../../controllers/admin/couponController');


router.get('/', renderCouponPage);

router.post('/add', addCoupon);
router.patch('/edit/:id', editCoupon);
router.patch('/delete/:id', deleteCoupon);


module.exports = router;
