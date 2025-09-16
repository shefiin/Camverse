const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Wishlist = require('../../models/wishlist')
 


const renderCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
    
        const brands = await Brand.find({isDeleted: false});
        const categories = await Category.find({isDeleted: false});

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
            }, 0);

            totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

            totalMRP = cart.items.reduce((sum, item) => {
                const mrp = item.product.mrp || item.product.price;
                return sum + (mrp * item.quantity)
            },0);

            totalDiscount = totalMRP - total;

        }    
    
    
        res.render('user/account/cart', {
            user,
            brands,
            categories,
            cart,
            total,
            totalQuantity,
            totalMRP,
            totalDiscount
        })
    } catch(error){
        console.error(error);
        res.status(400).send('some error');
    }    
};


const addToCart = async(req, res) => {
    try {
        
        const userId = req.session.userId;
        const { productId, quantity } = req.body;
        const redirectTo = req.body.redirectTo || `/product/${productId}`;
        

        if(!productId) return res.status(400).send('Product ID is required');

        const product = await Product.findById(productId);
        if(!product) return res.status(400).send('Product not found');
        if(product.stock < 1) return res.status(400).send('Product out of stock');
        if(product.isDeleted === true) return res.status(400).send('product is deleted')

        let cart = await Cart.findOne({ user: userId });
        if(!cart) {
            cart = new Cart({ user: userId, items: [] });
        }    

        let wishlist = await Wishlist.findOne({user: userId});

        if(wishlist){
            const existInWishlistIndex = wishlist.items.findIndex(
                item => item.product.toString() === productId
            );
            wishlist.items.splice(existInWishlistIndex, 1)
            await wishlist.save();
        }


        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if(existingItemIndex > -1) {
            return res.redirect(`${redirectTo}?cartStatus=exists`);
        } else {
            cart.items.push({
                product: productId,
                quantity: Number(quantity) || 1
            });
        }

        await cart.save();

        res.redirect(`${redirectTo}?cartStatus=added`);

    } catch(error){
        console.error(error);
        res.status(400).send('something wrong');
        
    }
};


const decreaseQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const  productId  = req.params.id;

        const cart = await Cart.findOne({ user: userId });
        if(!cart) return res.status(404).send('cart not found');

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        )

        if(itemIndex === -1){
            return res.status(400).send('Item not in cart');
        }

        cart.items[itemIndex].quantity -= 1;

        if(cart.items[itemIndex].quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }

        await cart.save();

        res.redirect('/cart');

    } catch(error) {
        console.error(error);
        res.status(400).send('error while decreasing item');
    }
};


const increaseQuantity = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id;

        const cart = await Cart.findOne({ user: userId});
        if(!cart){
            return res.status(400).send('cart not exist');
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if(itemIndex === -1){
            res.status(400).send('item does not exist');
        }

        cart.items[itemIndex].quantity += 1;

        await cart.save();

        res.redirect('/cart');

    } catch (error) {
        console.error(error);
        res.status(400).send('something wrong while increasing the item')
    }    
};


const removeProduct = async (req, res) => {
    try {
        const userId = req.session.userId;
        const productId = req.params.id;

        const cart = await Cart.findOne({ user: userId });

        if(!cart) return res.status(400).send('no such cart');

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        )

        if(itemIndex === -1 ) return res.status(400).send('no such product');

        cart.items.splice(itemIndex, 1);

        await cart.save();

        res.redirect('/cart');

    } catch(error){
        console.error(error);
        res.status(400).send('error while removing product');
    }

};


module.exports = {
    renderCart,
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    removeProduct
}