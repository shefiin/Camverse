const express = require('express');
const router = express.Router();

const { renderOrders, orderDetails, updateOrderStatus, acceptReturn } = require('../../controllers/admin/orderController');


router.get('/', renderOrders);

router.get('/edit/:id', orderDetails)

router.patch('/status/update/:id', updateOrderStatus);

router.patch('/:orderId/return/:productId', acceptReturn);


module.exports = router;