const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Order = require('../../models/order');
const urlencodedser = require('../../models/user');
const { createRazorpayOrder } = require('../user/paymentController');
const PDFDocument = require("pdfkit");



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

        const quantity = cart.items.length;

        const grossAmount = cart.items.reduce((sum, item) => {
            return sum + item.product.mrp * item.quantity;
        }, 0);

        const offerAmount = cart.items.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
        }, 0);

        const discount = grossAmount - offerAmount;

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
            totalQuantity: quantity,
            grossAmount: grossAmount,
            totalDiscount: discount,
            totalAmount: offerAmount,
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
    getInvoice
}