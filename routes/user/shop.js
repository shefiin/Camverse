const express = require('express');
const router = express.Router();
const { loadShopPage, getProductsByCategory, getProductsByBrand} = require('../../controllers/user/shopController');


router.get('/', loadShopPage);

router.get('/category/:id', getProductsByCategory);

router.get('/brand/:id', getProductsByBrand);







module.exports = router;