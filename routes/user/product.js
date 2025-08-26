const express = require('express');
const router = express.Router();
const { getProductDetails } = require('../../controllers/user/productController');


router.get('/:id', getProductDetails);


module.exports = router;