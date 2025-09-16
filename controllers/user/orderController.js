const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Order = require('../../models/order');
const urlencodedser = require('../../models/user');
const { createRazorpayOrder } = require('../user/paymentController');




const createCodOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId)
        const { payment } = req.body;
        const address = user.addresses.id(req.body.addressId);


        const cart = await Cart.findOne({ user: userId })
            .populate('items.product');

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
                price: i.product.price,
                status: "Placed",
                placedAt: new Date()
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
            paymentStatus: payment === 'Cash on delivery' ? 'Pending' : 'Completed',
            createdAt: new Date()
        });


        for(const item of cart.items){
            const product = item.product;
            if(product.stock < item.quantity){
                return res.status(400).send(`Not enough stock for ${product.name}`)
            }
            product.stock -= item.quantity;
            await product.save();
        }


        await order.save();


        cart.items = [];
        await cart.save();

        if(payment === 'Cash on delivery') {
            return res.redirect(`/order/order-success/${order._id}`)
        } else {
            return res.redirect('/payment')
        }
    } catch (error){
        console.error(error);
        res.status(400).send('something went wrong while placing the order');
    }
};



const placeOrder = async (req, res) => {
    const { payment } = req.body;
  
    if (payment === "Cash on delivery") {
      return await createCodOrder(req, res);
    } else if (payment === "online") {
      // Call Razorpay order creation
      return await createRazorpayOrder(req, res);
    }
};


const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order || order.user.toString() !== userId.toString()) {
            return res.status(404).send('Order not found');
        }

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
            status: order.status,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            statusTimestamps: order.statusTimestamps
        });

    } catch(error){
        console.error(error);
        res.status(400).send('error while rendering order details');
    }

};



const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.userId;
    
        const order = await Order.findById(orderId)
            .populate('products');

        if(!order) return res.status(400).send('order not found');
    
        if(order.status === 'Delivered' || order.status === 'Cancelled'){
            return res.status(400).send('This order cannot be cancelled');
        }
    
        for(const item of order.products){
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });

            item.status = 'Cancelled';
        }

        order.status = 'Cancelled';
        order.cancelledAt = new Date();
        await order.save();
    
        res.redirect(`/order/details/${orderId}`);

    } catch(error){
        console.log(error);
        res.status(400).send('Something went wrong while cancelling order');
    }
}; 


const cancelProduct = async (req, res) => {
    try {
      const { orderId, productId } = req.params; // orderId = CAMV-xxxxxx
      const userId = req.session.userId;
  
      const order = await Order.findOne({ _id: orderId, user: userId });      
      if (!order) return res.status(400).send("Order not found");
  
      if (order.status === "Delivered" || order.status === "Cancelled") {
        return res.status(400).send("Order cannot be modified");
      }
  
      const product = order.products.find(
        (p) => p.productId.toString() === productId
      );
  
      if (!product) return res.status(400).send("Product not found in order");
  
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: product.quantity }
      });
  
      product.status = "Cancelled";
      order.markModified("products");
      await order.save();
  
      res.redirect(`/order/details/${orderId}`); // ✅ redirect using custom ID
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send("Something went wrong while cancelling product");
    }
};


const returnOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.userId;


        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return res.status(400).send("Order not found");


        if (order.status !== "Delivered" || order.status === "Cancelled") {
            return res.status(400).send("Order cannot be modified");
        }

        for(let item of order.products) {
            item.status = "Return in process";
        }

        await order.save();
        res.redirect(`/order/details/${orderId}`);

    } catch (err) {
        console.error(err);
        res
          .status(500)
          .send("Something went wrong while returning order");
      }
};



const returnProduct = async (req, res) => {
    try {
        const {orderId, productId } = req.params;
        const userId = req.session.userId;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if(!order) return res.status(400).send('order not found');

        if (order.status !== "Delivered" || order.status === "Cancelled") {
            return res.status(400).send("Order cannot be modified");
        }

        const product = order.products.find(
            (p) => p.productId.toString() === productId
        );

        if (!product) return res.status(400).send("Product not found in order");

        product.status = "Return in process";
        await order.save();
        
        res.redirect(`/order/details/${orderId}`);

    } catch (err) {
        console.error(err);
        res
          .status(500)
          .send("Something went wrong while returning product");
      }
}
  








module.exports = { 
    placeOrder,
    createCodOrder,
    orderSuccess,
    orderDetails,
    orders,
    cancelOrder,
    cancelProduct,
    returnOrder,
    returnProduct
}