const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');




const RenderCheckout = async (req, res) => {
    try{
        const userId = req.session.userId;
        const user = await User.findById(userId);
        
        const brands = await Brand.find({isDeleted : false });
        const categories = await Category.find({isDeleted : false });

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'brand' },
                    { path: 'category' }
                ]
            });

        let total = 0;
        let totalQuantity = 0;
        let totalMRP = 0;
        let totalDiscount = 0;

        if(cart) {
            cart.items = cart.items.filter(item => {
                if(!item.product) return false;
                if(item.product.isDeleted) return false;
                if(item.product.brand && item.product.brand.isDeleted) return false;
                if(item.product.category && item.product.category.isDeleted) return false;
                return true;
            });

            cart.items = cart.items.sort((a, b) => b.addedAt - a.addedAt);

            total = cart.items.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            },0);

            totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

            totalMRP = cart.items.reduce((sum, item) => {
                const mrp = item.product.mrp || item.product.price;
                return sum + (mrp * item.quantity)
            },0);

            totalDiscount = totalMRP - total;
        }  
        
        res.render('user/account/checkout', {
            user,
            addresses: user.addresses,
            brands,
            categories,
            cart,
            total,
            totalQuantity,
            totalMRP,
            totalDiscount
        });

    } catch(error){
        console.error(error);
        res.status(400).send('error while rendering checkout');
    } 
};


module.exports = {
    RenderCheckout,
}