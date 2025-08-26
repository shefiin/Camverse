const express = require('express');
const router = express.Router();

const { renderCart, 
        addToCart, 
        decreaseQuantity, 
        increaseQuantity, 
        removeProduct } = require('../../controllers/user/cartController')

router.get('/', renderCart)

router.post('/add', addToCart);

router.post('/decrease/:id', decreaseQuantity);

router.post('/increase/:id', increaseQuantity);

router.post('/remove/:id', removeProduct);


module.exports = router;