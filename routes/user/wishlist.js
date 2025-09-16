const express = require('express');
const router = express.Router();
const { renderWishlist, 
        addToWishlist, 
        removeFromWishlist} = require('../../controllers/user/wishlistController')


router.get('/', renderWishlist);

router.post('/add', addToWishlist);

router.patch('/remove/:id', removeFromWishlist)


module.exports = router;