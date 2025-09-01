const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Order = require('../../models/order');
const urlencodedser = require('../../models/user');




const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId)
        const { payment } = req.body;
        const address = user.addresses.id(req.body.addressId);


        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if(!cart || cart.items.length === 0) {
            return res.status(400).send('Cart is empty');
        }

        const total = cart.items.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
        }, 0);

        const timestamp = Date.now();
        const orderId = 'CAMV-' + timestamp.toString().slice(-6);

        const order = new Order({
            user: userId,
            orderId,
            products: cart.items.map(i => ({
                productId: i.product._id,
                quantity: i.quantity,
                price: i.product.price
            })),
            shippingAddress: {
                fullName: address.fullName,
                mobile: address.mobile,
                pincode: address.pincode,
                house: address.house,
                area: address.area,
                landmark: address.landmark,
                city: address.city,
                state: address.city
            },
            totalAmount: total,
            paymentMethod: payment,
            paymentStatus: payment === 'COD' ? 'Pending' : 'Completed',
            createdAt: new Date()
        });

        await order.save();


        cart.items = [];
        await cart.save();

        if(payment === 'COD') {
            return res.redirect('/order/order-success')
        } else {
            return res.redirect('/payment')
        }
    } catch (error){
        console.error(error);
        res.status(400).send('something went wrong while placing the order');
    }
};



const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.userId;
        const order = await Order.findOne({ user: userId });

        const user = await User.findById(userId);
        const brands = await Brand.find({isDeleted : false });
        const categories = await Category.find({isDeleted : false });

        const orderDate = order.orderDate;
        const formattedDate = orderDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        

        res.render('user/account/order-success', {
            order: order._id,
            user,
            brands,
            categories,
            orderID: order.orderId,
            date: formattedDate,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount
        });

    } catch(error){
        console.error(error);
        res.status(400).send('something wrong while rendering order success page');
    }
};



const orders = async (req, res) => {
    try{
        const userId = req.session.userId;
        const orders = await Order.find({ user: userId })
        .populate({
            path: "products.productId",
            model: "Product",
            select: "name brand images price",
            populate: {
              path: "brand",
              model: "Brand",
              select: "name"   // only fetch brand name
            }
          })
          .sort({ createdAt: -1 });
        

        const user = await User.findById(userId);
        const brands = await Brand.find({isDeleted : false });
        const categories = await Category.find({isDeleted : false });

        res.render('user/account/orders', {
            orders,
            user,
            brands,
            categories
        });

    } catch(error){
        console.error(error);
        res.status(400).send('some error while rendering orders page');
    }
};



const orderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = req.params.id;

        const order = await Order.findById(orderId)
            .populate("products.productId");


        const user = await User.findById(userId);
        const brands = await Brand.find({isDeleted : false });
        const categories = await Category.find({isDeleted : false });

        const orderDate = order.orderDate;
        const formattedDate = orderDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        res.render('user/account/order-details', {
            order,
            user,
            brands,
            categories,
            orderID: order.orderId,
            date: formattedDate,
            address: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount
        });

    } catch(error){
        console.error(error);
        res.status(400).send('error while rendering order details');
    }

};






module.exports = { 
    placeOrder,
    orderSuccess,
    orderDetails,
    orders
}