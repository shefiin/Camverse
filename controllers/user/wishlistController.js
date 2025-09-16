const Brand = require('../../models/brand');
const Category = require('../../models/category');
const User = require('../../models/product');
const Wishlist = require('../../models/wishlist');
const Product = require('../../models/product');
const Cart = require('../../models/cart');




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
    try {
      const userId = req.session.userId;
      const { productId } = req.body;
      const redirectTo = req.body.redirectTo || `/product/${productId}`;
  
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
  
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
        return res.redirect(`${redirectTo}?status=exists`);
      }
  
      // ✅ Add product to wishlist
      wishlist.items.push({ product: productId });
      await wishlist.save();
  
      res.redirect(`${redirectTo}?status=added`);
    } catch (error) {
      console.error(error);
      res.redirect(`/product/${productId}?status=error`);
    }
  };
  


const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id;
        const wishlist = await Wishlist.findOne({user: userId});

        if(!wishlist){
            res.status(400).send('no wishlist');
        }

        const index = wishlist.items.findIndex(
            item => item.product.toString() === productId 
        )

        if (index > -1) {
            wishlist.items.splice(index, 1);
            await wishlist.save();
            return res.redirect('/wishlist'); 
          } else {
            return res.status(404).send("Product not found in wishlist");
        }


    } catch(error){
        console.log(error);
        res.status(400).send('some error while removing form wishlist');
    }
}





module.exports = {
    renderWishlist,
    addToWishlist,
    removeFromWishlist
}