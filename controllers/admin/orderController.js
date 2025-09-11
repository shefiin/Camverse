const { findById } = require('../../models/admin');
const Order = require('../../models/order');



const renderOrders = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page -1) * limit


        const filter = {
            $or: [
                { name: { $regex: search, $options: 'i' }},
                { status: { $regex: search, $options: 'i' } },
            ]
        };

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);


        const orders = await Order.find(filter)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit) 
            .populate('user')
            .populate('products.productId')       

        res.render('admin/orders', {
            orders,
            currentPage: page,
            totalPages,
            search,
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


module.exports = {
    renderOrders,
    orderDetails
}