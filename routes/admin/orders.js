const express = require('express');
const router = express.Router();

const { renderOrders, orderDetails } = require('../../controllers/admin/orderController');


router.get('/', renderOrders);

router.get('/edit/:id', orderDetails)


module.exports = router;