const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/order");
const User = require('../../models/user');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Coupon = require('../../models/coupon');
const Wallet = require('../../models/wallet');
const { getEffectiveUnitPrice } = require('../helpers/effectivePrice');


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const useWallet = req.body.useWallet === true || req.body.useWallet === "true" || req.body.useWallet === "on";
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        const address = user.addresses.id(req.body.addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Please select a delivery address" });
        }

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: "items.product",
                populate: [{ path: "category" }]
            });

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

        const subtotal = cart.items.reduce((sum, item) => {
            return sum + getEffectiveUnitPrice(item.product) * item.quantity
        }, 0);
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const grossAmount = cart.items.reduce((sum, item) => {
            return sum + (item.product.mrp || item.product.price) * item.quantity;
        }, 0);
        const productDiscount = grossAmount - subtotal;
        let couponDiscount = 0;
        let couponCode = null;
        let couponMinPurchase = 0;

        if (req.body.couponId) {
            const now = new Date();
            const coupon = await Coupon.findOne({
                _id: req.body.couponId,
                isDeleted: false,
                status: 'ACTIVE',
                startDate: { $lte: now },
                endDate: { $gte: now }
            });

            if (!coupon) {
                return res.status(400).json({ success: false, message: "Selected coupon is invalid or expired" });
            }

            if (subtotal < coupon.minPurchase) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum purchase ₹${coupon.minPurchase} required for this coupon`
                });
            }

            if (coupon.discountType === "FLAT") {
                couponDiscount = Number(coupon.discountValue) || 0;
            } else {
                couponDiscount = (subtotal * (Number(coupon.discountValue) || 0)) / 100;
                if (coupon.maxDiscount && coupon.maxDiscount > 0) {
                    couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
                }
            }

            couponDiscount = Math.min(subtotal, Math.round(couponDiscount));
            couponCode = coupon.name;
            couponMinPurchase = Number(coupon.minPurchase) || 0;
        }

        const totalAmount = Math.max(0, subtotal - couponDiscount);
        const totalDiscount = productDiscount + couponDiscount;
        const walletDoc = await Wallet.findOne({ user: userId });
        const walletBalance = Number(walletDoc?.balance || 0);
        const walletUsed = useWallet ? Math.min(walletBalance, totalAmount) : 0;
        const remainingAmount = Math.max(0, totalAmount - walletUsed);

        if (useWallet && walletBalance < walletUsed) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
        }

        const orderId = 'CAMV-' + Date.now().toString().slice(-6);

        if (remainingAmount === 0) {
            const walletOnlyOrder = new Order({
                user: userId,
                orderId,
                products: cart.items.map(i => ({
                    productId: i.product._id,
                    quantity: i.quantity,
                    price: getEffectiveUnitPrice(i.product),
                    status: "Placed"
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
                walletUsed,
                remainingAmount: 0,
                couponCode,
                couponDiscount,
                couponMinPurchase,
                paymentMethod: "Wallet",
                paymentStatus: "Paid",
                createdAt: new Date()
            });

            for (const item of cart.items) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Not enough stock for ${product.name}`
                    });
                }
                product.stock -= item.quantity;
                await product.save();
            }

            await walletOnlyOrder.save();

            let wallet = walletDoc;
            if (!wallet) {
                wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
            }
            wallet.balance -= walletUsed;
            wallet.transactions.push({
                type: "DEBIT",
                amount: walletUsed,
                orderId: walletOnlyOrder._id,
                description: "Wallet used for order payment"
            });
            await wallet.save();

            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { items: [] } }
            );

            return res.json({
                success: true,
                walletOnly: true,
                orderId: walletOnlyOrder._id
            });
        }

        const options = {
            amount: remainingAmount * 100,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const order = new Order({
            user: userId,
            orderId,
            razorpayOrderId: razorpayOrder.id,
            products: cart.items.map(i => ({
                productId: i.product._id,
                quantity: i.quantity,
                price: getEffectiveUnitPrice(i.product),
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
            walletUsed,
            remainingAmount,
            couponCode,
            couponDiscount,
            couponMinPurchase,
            paymentMethod: "Online",
            paymentStatus: "Pending",
            createdAt: new Date()
        });

        await order.save();

        if (walletUsed > 0) {
            let wallet = walletDoc;
            if (!wallet) {
                wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
            }
            wallet.balance -= walletUsed;
            wallet.transactions.push({
                type: "DEBIT",
                amount: walletUsed,
                orderId: order._id,
                description: "Wallet used for order payment"
            });
            await wallet.save();
        }

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
