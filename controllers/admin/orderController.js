const { now } = require('mongoose');
const { findById } = require('../../models/admin');
const Order = require('../../models/order');
const Product = require('../../models/product');
const Wallet = require('../../models/wallet')



const renderOrders = async (req, res) => {
    try {
        const search = req.query.search || '';
        const statusFilter = req.query.status || '';
        const sort = req.query.sort || '-orderDate';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page -1) * limit


        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { "products.productId.name": { $regex: search, $options: "i" } }
            ];
        }

        if (statusFilter) {
            filter.status = statusFilter;
        }

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);


        const orders = await Order.find(filter)
            .populate('user')
            .populate('products.productId')  
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)      

        res.render('admin/orders', {
            orders,
            currentPage: page,
            totalPages,
            search,
            statusFilter,
            sort,
            skip,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        });

    } catch (err) {
        console.log(err);
        res.render('admin/orders', {
            orders: [],
            currentPage: 1,
            totalPages: 1,
            search: '',
            statusFilter: '',
            sort: '-orderDate',
            prevPage: null,
            nextPage: null,
        });
    }
};



const orderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId)
            .populate("products.productId")
            .populate("user")

        const orderDate = order.orderDate;
        const formattedDate = orderDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });    


        res.render('admin/order-details', {
            order,
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
}



const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const order = await Order.findById(orderId)
            .populate("products");

        if (!order) {
            return res.status(404).send("Order not found");
        }    

        order.products.forEach((item) => {
            if (item.status !== "Cancelled") {
                item.status = status;
            }
            });
        
        order.status = status;

        const now = new Date();
        switch (status){
            case "Shipped":
                order.shippedAt = now;
                break;
            case "Out for delivery":
                order.outForDeliveryAt = now;
                break;
            case "Delivered":
                order.deliveredAt = now;
                order.paymentStatus = 'Paid'
                break;
            case "Cancelled":
                order.cancelledAt = now;
                break;
            case "Returned":
                order.returnedAt =  now;
                break;                    
        }

        await order.save();
        res.redirect(`/admin/orders/edit/${order._id}`);

    } catch(error){
        console.log(error);
        res.status(400).send('something wrong while updating order');
    }
}



const acceptReturn = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { action } = req.body;
        const order = await Order.findById(orderId)
            .populate('products.productId')
            .populate("user");

        const product = order.products.find(
            p => p._id.toString() === productId
        );
        
        if(action === "accept") {
            await Product.findByIdAndUpdate(product.productId, {
                $inc: { stock: product.quantity }
            });

            const refundAmount = product.price * product.quantity;

            let userWallet = await Wallet.findOne({ user: order.user._id });
            if(!userWallet) {
                userWallet = new Wallet({
                    user: order.user._id,
                    balance: 0,
                    transactions: []
                });
            }

            userWallet.balance += refundAmount;
            userWallet.transactions.push({
                type: "CREDIT",
                amount: refundAmount,
                orderId: order._id,
                description: `Refund for returned item in order #${order.orderId}`
            });

            await userWallet.save();

            product.status = "Returned";
            order.returnedAt = new Date();

        } else {
            product.status = "Delivered";
        }
        
        await order.save();

        res.redirect(`/admin/orders/edit/${order._id}`);

    } catch(error){
        console.log(error);
        res.status(400).send('something wrong while acceptin return');
    }   

}


module.exports = {
    renderOrders,
    orderDetails,
    updateOrderStatus,
    acceptReturn
}