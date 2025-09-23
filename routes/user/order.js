const express = require('express');
const router = express.Router();
const {verifyPayment} = require('../../controllers/user/paymentController')
const { placeOrder, 
        orderSuccess, 
        orderDetails, 
        orders, 
        cancelOrder, 
        cancelProduct, 
        returnOrder, 
        returnProduct, 
        getInvoice} = require('../../controllers/user/orderController');




router.post('/', placeOrder);

router.post("/verify", verifyPayment);

router.get('/order-success/:id', orderSuccess);

router.get('/details', orders);

router.get('/details/:id', orderDetails);

router.patch('/cancel/:id', cancelOrder);

router.patch('/:orderId/cancel/:productId', cancelProduct);

router.patch('/return/:id', returnOrder)

router.patch('/:orderId/return/:productId', returnProduct);

router.get('/invoice/:id', getInvoice);



module.exports = router;