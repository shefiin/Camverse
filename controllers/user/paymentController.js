const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/order");
const User = require('../../models/user');
const Cart = require('../../models/cart');
const Product = require('../../models/product');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        const address = user.addresses.id(req.body.addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Please select a delivery address" });
        }

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        if(!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        for (const item of cart.items) {
            if (!item.product) {
                return res.status(400).json({ success: false, message: "One or more products are unavailable" });
            }
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${item.product.name}`
                });
            }
        }

        const totalAmount = cart.items.reduce((sum, item) => {
            return sum + item.product.price * item.quantity
        }, 0);
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const grossAmount = cart.items.reduce((sum, item) => {
            return sum + (item.product.mrp || item.product.price) * item.quantity;
        }, 0);
        const totalDiscount = grossAmount - totalAmount;

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const orderId = 'CAMV-' + Date.now().toString().slice(-6);

        const order = new Order({
            user: userId,
            orderId,
            razorpayOrderId: razorpayOrder.id,
            products: cart.items.map(i => ({
                productId: i.product._id,
                quantity: i.quantity,
                price: i.product.price,
                status: "Pending"
            })),
            shippingAddress: {
                fullName: address.fullName,
                mobile: address.mobile,
                pincode: address.pincode,
                house: address.house,
                area: address.area,
                landmark: address.landmark,
                city: address.city,
                state: address.state
            },
            totalQuantity,
            grossAmount,
            totalDiscount,
            totalAmount,
            paymentMethod: "Online",
            paymentStatus: "Pending",
            createdAt: new Date()
        });

        await order.save();

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            orderDbId: order._id,
            customer: {
                name: user.name || address.fullName || "",
                email: user.email || "",
                contact: address.mobile || ""
            }
        });

    } catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating Razorpay order" });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");


        if(expectedSignature === razorpay_signature) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    paymentStatus: "Paid",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    "products.$[].status" : "Placed"
                },
                { new: true }
            ).populate("products.productId");

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            for(const item of order.products) {
                const product = await Product.findById(item.productId._id || item.productId);
                if (!product) {
                    return res.status(400).json({ success: false, message: "Product not found during verification" });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name}. Please contact support.`
                    });
                }
                product.stock -= item.quantity;
                await product.save();
            }

            await Cart.findOneAndUpdate(
                { user: order.user },
                { $set: { items: [] }}
            );

            return res.json({ success: true, orderId: order._id});
        } else {
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: "Failed" }
            );
            return res.status(400).json({ success: false, message: "Signature mismatch" });
        }
    } catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};


module.exports = {
    createRazorpayOrder,
    verifyPayment
}
