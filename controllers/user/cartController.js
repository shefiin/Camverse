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
        let discount = 0;
        let extraDiscount = 0;
        let totalDiscount = 0;
        const now = new Date();

        const isOfferActive = (offer) => {
            if (!offer || !offer.isActive) return false;
            if (!offer.discountValue || Number(offer.discountValue) <= 0) return false;
            const startsAt = offer.startDate ? new Date(offer.startDate) : null;
            const endsAt = offer.endDate ? new Date(offer.endDate) : null;
            if (startsAt && now < startsAt) return false;
            if (endsAt && now > endsAt) return false;
            return true;
        };

        const getEffectiveUnitPrice = (product) => {
            const productOffer = isOfferActive(product.individualOffer) ? product.individualOffer : null;
            const categoryOffer = isOfferActive(product.category?.individualOffer) ? product.category.individualOffer : null;
            const activeOffer = productOffer || categoryOffer;

            if (!activeOffer) return product.price;

            let offerDiscount = 0;
            if (activeOffer.discountType === "FLAT") {
                offerDiscount = Number(activeOffer.discountValue) || 0;
            } else {
                offerDiscount = (product.price * (Number(activeOffer.discountValue) || 0)) / 100;
            }

            return Math.max(0, Math.round(product.price - offerDiscount));
        };

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
                const effectivePrice = getEffectiveUnitPrice(item.product);
                return sum + (effectivePrice * item.quantity);
            }, 0);

            totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

            totalMRP = cart.items.reduce((sum, item) => {
                const mrp = item.product.mrp || item.product.price;
                return sum + (mrp * item.quantity)
            },0);

            discount = cart.items.reduce((sum, item) => {
                const mrp = item.product.mrp || item.product.price;
                return sum + Math.max(0, (mrp - item.product.price) * item.quantity);
            }, 0);

            extraDiscount = cart.items.reduce((sum, item) => {
                const effectivePrice = getEffectiveUnitPrice(item.product);
                return sum + Math.max(0, (item.product.price - effectivePrice) * item.quantity);
            }, 0);

            totalDiscount = discount + extraDiscount;

        }    
    
    
        res.render('user/account/cart', {
            user,
            brands,
            categories,
            cart,
            total,
            totalQuantity,
            totalMRP,
            discount,
            extraDiscount,
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
            if (existInWishlistIndex > -1) {
                wishlist.items.splice(existInWishlistIndex, 1);
                await wishlist.save();
            }
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
