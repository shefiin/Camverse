const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/order");
const User = require('../../models/user');
const Cart = require('../../models/cart');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createRazorpayOrder = async (req, res) => {
    try {

        const userId = req.session.userId;
        const user = await User.findById(userId)
        const address = user.addresses.id(req.body.addressId);

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        if(!cart || cart.items.length === 0) {
            return res.status(400).send("Cart is empty");
        }    

        const total = cart.items.reduce((sum, item) => {
            return sum + item.product.price * item.quantity
        },0)

        const { amount, receipt } = req.body;

        const options = {
            amount: total * 100,
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
                city: address.landmark,
                city: address.city,
                state: address.state
            },
            totalAmount: total,
            paymentMethod: "Online",
            paymentStatus: "Pending"
        });

        await order.save();

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch(error){
        console.error(error);
        res.status(500).send('Error creating Razorpay order');
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
            const order =  await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { 
                    paymentStatus: "Paid",
                    razorpayPaymentId: razorpay_payment_id,
                    "products.$[].status" : "Placed"
                },
                { new: true }
            ).populate("products.productId");

            for(const item of order.products) {
                const product = await Product.findById(item.productId);
                product.stock -= item.quantity;
                await product.save();
            }

            await Cart.findOneAndUpdate(
                { user: order.user },
                { $set: { items: [] }}
            );

            return res.json({ success: true, orderId: order._id});
        } else {
            return res.json({ success: false, message: "Signature mismatch" });
        }
    } catch(error){
        console.error(error);
        res.status(500).json({ error: "Payment verification failed" });
    }
};


module.exports = {
    createRazorpayOrder,
    verifyPayment
}