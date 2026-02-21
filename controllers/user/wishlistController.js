const Brand = require('../../models/brand');
const Category = require('../../models/category');
const User = require('../../models/user');
const Wishlist = require('../../models/wishlist');
const Product = require('../../models/product');
const Cart = require('../../models/cart');

const isJsonRequest = (req) =>
  req.xhr ||
  (req.headers.accept && req.headers.accept.includes('application/json')) ||
  (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));



const renderWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);

        const wishlist = await Wishlist.findOne({user: userId})
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'brand' },
                    { path: 'category' }
                ]
            });

        const brands = await Brand.find();
        const categories = await Category.find();


        if(wishlist) {
            wishlist.items = wishlist.items.filter(item => {
                if(!item.product) return false;
                if(item.product.isDeleted) return false;
                if(item.product.brand && item.product.brand.isDeleted) return false;
                if(item.product.category && item.product.category.isDeleted) return false;
                return true;
            });

            wishlist.items = wishlist.items.sort((a, b) => b.addedAt - a.addedAt);

        }   

        res.render('user/account/wishlist', {
            user,
            brands,
            categories,
            wishlist,
        });

    } catch(error){
        console.error(error);
        res.status(400).send('some error');
    }    
};



const addToWishlist = async (req, res) => {
    let productId;
    try {
      const userId = req.session.userId;
      productId = req.body.productId;
      const redirectTo = req.body.redirectTo || `/product/${productId}`;
  
      const user = await User.findById(userId);
      const product = await Product.findById(productId);

      if (!user || !product) {
        if (isJsonRequest(req)) {
          return res.status(404).json({ success: false, message: 'User or product not found' });
        }
        return res.redirect(`${redirectTo}?status=error`);
      }
  
      let cart = await Cart.findOne({ user: userId });
      let wishlist = await Wishlist.findOne({ user: userId });
  
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, items: [] });
      }
  
      // ✅ If product is in cart → remove it
      if (cart) {
        const existInCartIndex = cart.items.findIndex(
          item => item.product.toString() === productId
        );
        if (existInCartIndex > -1) {
          cart.items.splice(existInCartIndex, 1);
          await cart.save();
        }
      }
  
      // ✅ If product already in wishlist → show message
      const existingItemIndex = wishlist.items.findIndex(
        item => item.product.toString() === productId
      );
      if (existingItemIndex > -1) {
        if (isJsonRequest(req)) {
          return res.status(200).json({ success: true, status: 'exists', inWishlist: true });
        }
        return res.redirect(`${redirectTo}?status=exists`);
      }
  
      // ✅ Add product to wishlist
      wishlist.items.push({ product: productId });
      await wishlist.save();

      if (isJsonRequest(req)) {
        return res.status(200).json({ success: true, status: 'added', inWishlist: true });
      }
      res.redirect(`${redirectTo}?status=added`);
    } catch (error) {
      console.error(error);
      if (isJsonRequest(req)) {
        return res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
      }
      res.redirect(`/product/${productId}?status=error`);
    }
  };
  


const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id || req.body.productId;
        const redirectTo = req.body.redirectTo || '/wishlist';
        const wishlist = await Wishlist.findOne({user: userId});

        if(!wishlist){
            if (isJsonRequest(req)) {
                return res.status(404).json({ success: false, message: 'Wishlist not found' });
            }
            return res.redirect(redirectTo);
        }

        const index = wishlist.items.findIndex(
            item => item.product.toString() === productId 
        )

        if (index > -1) {
            wishlist.items.splice(index, 1);
            await wishlist.save();
            if (isJsonRequest(req)) {
                return res.status(200).json({ success: true, status: 'removed', inWishlist: false });
            }
            return res.redirect(redirectTo);
          } else {
            if (isJsonRequest(req)) {
                return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
            }
            return res.redirect(redirectTo);
        }


    } catch(error){
        console.log(error);
        if (isJsonRequest(req)) {
            return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
        }
        return res.status(400).send('some error while removing form wishlist');
    }
}





module.exports = {
    renderWishlist,
    addToWishlist,
    removeFromWishlist
}
