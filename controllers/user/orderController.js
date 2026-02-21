const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Order = require('../../models/order');
const Coupon = require('../../models/coupon');
const Wallet = require('../../models/wallet');
const urlencodedser = require('../../models/user');
const { createRazorpayOrder } = require('../user/paymentController');
const PDFDocument = require("pdfkit");
const razorpay = require("../../config/razorpay");
const crypto = require("crypto");



// const createCodOrder = async (req, res) => {
//     try {
//         const userId = req.session.userId;
//         const user = await User.findById(userId)
//         const { payment } = req.body;
//         const address = user.addresses.id(req.body.addressId);


//         const cart = await Cart.findOne({ user: userId })
//             .populate('items.product');

//         if(!cart || cart.items.length === 0) {
//             return res.status(400).send('Cart is empty');
//         }

//         const quantity = cart.items.length;

//         const grossAmount = cart.items.reduce((sum, item) => {
//             return sum + item.product.mrp * item.quantity;
//         }, 0);

//         const offerAmount = cart.items.reduce((sum, item) => {
//             return sum + item.product.price * item.quantity;
//         }, 0);

//         const discount = grossAmount - offerAmount;

//         const timestamp = Date.now();
        


//         if (payment === "online") {

//             const razorpayOrder = await razorpay.orders.create({
//                 amount: offerAmount * 100,
//                 currency: "INR",
//                 receipt: "rcpt_" + Date.now(),
//             });

//             return res.json({
//                 success: true,
//                 key: process.env.RAZORPAY_KEY_ID,
//                 amount: razorpayOrder.amount,
//                 currency: razorpayOrder.currency,
//                 razorpayOrderId: razorpayOrder.id,
//                 customer: {
//                     name: user.name,
//                     email: user.email,
//                     contact: user.mobile
//                 }
//             });
//         }

//         const orderId = 'CAMV-' + timestamp.toString().slice(-6);

//         const order = new Order({
//             user: userId,
//             orderId,
//             products: cart.items.map(i => ({
//                 productId: i.product._id,
//                 quantity: i.quantity,
//                 price: i.product.price,
//                 status: "Placed",
//                 placedAt: new Date()
//             })),
//             shippingAddress: {
//                 fullName: address.fullName,
//                 mobile: address.mobile,
//                 pincode: address.pincode,
//                 house: address.house,
//                 area: address.area,
//                 landmark: address.landmark,
//                 city: address.city,
//                 state: address.state
//             },
//             totalQuantity: quantity,
//             grossAmount: grossAmount,
//             totalDiscount: discount,
//             totalAmount: offerAmount,
//             paymentMethod: payment,
//             paymentStatus: payment === 'Cash on delivery' ? 'Pending' : 'Completed',
//             createdAt: new Date()
//         });


//         for(const item of cart.items){
//             const product = item.product;
//             if(product.stock < item.quantity){
//                 return res.status(400).send(`Not enough stock for ${product.name}`)
//             }
//             product.stock -= item.quantity;
//             await product.save();
//         }


//         await order.save();
//         cart.items = [];
//         await cart.save();

//         return res.redirect(`/order/order-success/${order._id}`);

//     } catch (error){
//         console.error(error);
//         res.status(400).send('something went wrong while placing the order');
//     }
// };

const createCodOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const { payment } = req.body;
        const useWallet = req.body.useWallet === true || req.body.useWallet === "true" || req.body.useWallet === "on";

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const address = user.addresses.id(req.body.addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: "Please select a delivery address" });
        }

        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const quantity = cart.items.length;

        const grossAmount = cart.items.reduce((sum, item) =>
            sum + item.product.mrp * item.quantity, 0);

        const subtotal = cart.items.reduce((sum, item) =>
            sum + item.product.price * item.quantity, 0);

        const productDiscount = grossAmount - subtotal;
        let couponDiscount = 0;
        let couponCode = null;

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
        }

        const offerAmount = Math.max(0, subtotal - couponDiscount);
        const discount = productDiscount + couponDiscount;
        const walletDoc = await Wallet.findOne({ user: userId });
        const walletBalance = Number(walletDoc?.balance || 0);
        const walletUsed = useWallet ? Math.min(walletBalance, offerAmount) : 0;
        const remainingAmount = Math.max(0, offerAmount - walletUsed);

        const timestamp = Date.now();

        // ==========================
        // 🔹 COD FLOW
        // ==========================

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
                state: address.state
            },
            totalQuantity: quantity,
            grossAmount,
            totalDiscount: discount,
            totalAmount: offerAmount,
            walletUsed,
            remainingAmount,
            couponCode,
            couponDiscount,
            paymentMethod: remainingAmount === 0 ? "Wallet" : "Cash on delivery",
            paymentStatus: remainingAmount === 0 ? "Paid" : "Pending",
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

        await order.save();

        if (walletUsed > 0) {
            let wallet = walletDoc;
            if (!wallet) {
                wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
            }
            if (wallet.balance < walletUsed) {
                return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
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

        cart.items = [];
        await cart.save();

        return res.redirect(`/order/order-success/${order._id}`);

    } catch (error) {
        console.error("Order Error:", error);

        // IMPORTANT: Always return JSON for safety
        return res.status(500).json({
            success: false,
            message: "Order processing failed"
        });
    }
};


const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    paymentStatus: "Paid",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    "products.$[].status": "Placed"
                },
                { new: true }
            ).populate("products.productId");

            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            for (const item of order.products) {
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
                { $set: { items: [] } }
            );

            return res.json({ success: true, orderId: order._id });
        }

        const failedOrder = await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { paymentStatus: "Failed" }
        ).populate("user");

        if (failedOrder && failedOrder.walletUsed > 0) {
            let wallet = await Wallet.findOne({ user: failedOrder.user._id || failedOrder.user });
            if (!wallet) {
                wallet = new Wallet({
                    user: failedOrder.user._id || failedOrder.user,
                    balance: 0,
                    transactions: []
                });
            }

            const existingRollback = wallet.transactions.find(
                txn =>
                    txn.type === "CREDIT" &&
                    txn.orderId?.toString() === failedOrder._id.toString() &&
                    txn.description === "Wallet refund for failed online payment"
            );

            if (!existingRollback) {
                wallet.balance += Number(failedOrder.walletUsed);
                wallet.transactions.push({
                    type: "CREDIT",
                    amount: Number(failedOrder.walletUsed),
                    orderId: failedOrder._id,
                    description: "Wallet refund for failed online payment"
                });
                await wallet.save();
            }
        }

        return res.status(400).json({ success: false, message: "Signature mismatch" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error?.message || "Payment verification failed"
        });
    }
};



const placeOrder = async (req, res) => {
    const { payment } = req.body || {};
    const wantsJson =
      (req.headers.accept || "").includes("application/json") ||
      req.xhr;
  
    if (payment === "Cash on delivery") {
      return await createCodOrder(req, res);
    } else if (payment === "online") {
      // Call Razorpay order creation
      return await createRazorpayOrder(req, res);
    }

    if (wantsJson) {
      return res.status(400).json({
        success: false,
        message: "Selected payment method is not available right now."
      });
    }

    return res.status(400).send("Selected payment method is not available right now.");
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
        const { reason, customReason } = req.body;

        const finalReason = reason === "Other" ? customReason : reason;
    
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
        order.cancelReason = finalReason;
        await order.save();
    
        res.redirect(`/order/details/${orderId}?status=cancelled`);

    } catch(error){
        console.log(error);
        res.status(400).send('Something went wrong while cancelling order');
    }
}; 


const cancelProduct = async (req, res) => {
    try {
      const { orderId, productId } = req.params; // orderId = CAMV-xxxxxx
      const userId = req.session.userId;
      const { reason2, productCustomReason } = req.body;

      const finalReason = reason2 === "Other" ? productCustomReason : reason2;
    
  
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
      product.cancelReason = finalReason;
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
        const { reason, customReason } = req.body;

        const finalReason = reason === "Other" ? customReason : reason;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) return res.status(400).send("Order not found");


        if (order.status !== "Delivered" || order.status === "Cancelled") {
            return res.status(400).send("Order cannot be modified");
        }

        for(let item of order.products) {
            item.status = "Return in process";
            item.returnReason = finalReason;
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
        const { reason2, productCustomReason } = req.body;

        const finalReason = reason2 === "Other" ? productCustomReason : reason2;

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
        product.returnReason = finalReason;
        await order.save();
        
        res.redirect(`/order/details/${orderId}`);

    } catch (err) {
        console.error(err);
        res
          .status(500)
          .send("Something went wrong while returning product");
      }
}



const getInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.userId;

    const user = await User.findById(userId);
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("products.productId"); // populate product details

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${orderId}.pdf`
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(20).text("INVOICE", { align: "center", underline: true });
    doc.moveDown(1);

    // ===== META INFO =====
    doc.fontSize(12);
    doc.text(`Invoice #: ${order.orderId}`);
    doc.text(`Date: ${order.orderDate.toDateString()}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ===== BILL TO / FROM =====
    const startY = doc.y;
    doc.fontSize(14).text("Bill To:", 50, startY, { underline: true });
    doc.fontSize(12);
    doc.text(order.user.name, 50);
    doc.text(order.shippingAddress.house, 50);
    doc.text(order.shippingAddress.area, 50);
    doc.text(order.shippingAddress.city, 50);
    doc.text(
      `${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      50
    );
    doc.text(order.shippingAddress.mobile, 50);

    doc.fontSize(14).text("Bill From:", 300, startY, { underline: true });
    doc.fontSize(12);
    doc.text("Camverse Pvt Ltd", 300);
    doc.text("123, E-commerce Street", 300);
    doc.text("Bangalore, India", 300);
    doc.text("support@camverse.com", 300);

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ===== PRODUCTS LIST =====
    doc.fontSize(14).text("Products", 50, doc.y);
    doc.moveDown(0.5);

    order.products.forEach((item, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${item.productId.name}`, // product name
        60,
        doc.y
      );
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ===== PRODUCTS TABLE =====
    doc.fontSize(12).text("No", 50, doc.y);
    doc.text("Qty", 200, doc.y);
    doc.text("Price", 350, doc.y);
    doc.text("Total", 450, doc.y);

    doc.moveTo(50, doc.y + 15).lineTo(550, doc.y + 15).stroke();

    let y = doc.y + 25;

    order.products.forEach((item, index) => {
      doc.text(index + 1, 50, y); // numbering
      doc.text(item.quantity.toString(), 200, y);
      doc.text(item.price.toFixed(2), 350, y);
      doc.text((item.quantity * item.price).toFixed(2), 450, y);
      y += 20;
    });

    doc.moveDown(2);
    doc.moveTo(50, y).lineTo(550, y).stroke();
    doc.moveDown(1);

    // ===== TOTALS =====
    doc.fontSize(12);
    doc.text(`Total Quantity: ${order.totalQuantity}`, { align: "right" });
    doc.text(`Gross Amount: ${order.grossAmount.toFixed(2)}`, {
      align: "right",
    });
    doc.text(`Discount: ${order.totalDiscount.toFixed(2)}`, {
      align: "right",
    });

    doc.moveDown(0.5);
    doc.fontSize(14).text(`Total Amount: ${order.totalAmount.toFixed(2)}`, {
      align: "right",
      underline: true,
    });

    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // ===== FOOTER =====
    doc.fontSize(10).text("Thank you for shopping with Camverse!", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(400).send("Some error while generating invoice");
  }
};



  



module.exports = { 
    placeOrder,
    createCodOrder,
    orderSuccess,
    orderDetails,
    orders,
    cancelOrder,
    cancelProduct,
    returnOrder,
    returnProduct,
    getInvoice,
    verifyPayment
}
