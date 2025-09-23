const express = require('express');
const router = express.Router();
const { renderOfferPage, 
        renderProductOffer, 
        addOffer, deleteOffer, 
        renderCategoryOffer, 
        addCategoryOffer} = require('../../controllers/admin/offerController');


router.get('/', renderOfferPage);

router.get('/product', renderProductOffer);

router.patch('/add/:id', addOffer);

router.patch('/delete/:id', deleteOffer);

//Category offer

router.get('/category', renderCategoryOffer);

router.patch('/category/add/:id', addCategoryOffer)



module.exports = router;

