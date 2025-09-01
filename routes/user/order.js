const express = require('express');
const router = express.Router();
const { placeOrder, orderSuccess, orderDetails, orders } = require('../../controllers/user/orderController');


router.post('/', placeOrder);

router.get('/order-success', orderSuccess);

router.get('/details', orders);

router.get('/details/:id', orderDetails)

module.exports = router;