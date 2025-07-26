const User = require('../../models/user');
const Order = require('../../models/order');
const Product = require('../../models/product');


const  ITEMS_PER_PAGE = 5

const renderDashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page -1) * ITEMS_PER_PAGE

        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const totalSales = await Order.aggregate([
            { $match: { status: "Delivered" }},
            { $group: { _id: null, total: { $sum: "$totalAmount" }}}
        ]);

        const productsSold = await Order.aggregate([
            { $match: { status: "Delivered" }},
            { $unwind: "$products" },
            { $group: { _id: null, totalQty: { $sum: "$products.quantity" }}}
        ]);

        const topProducts = await Product.find()
            .sort({ sold: -1 })
            .skip(skip)
            .limit(5);

        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / ITEMS_PER_PAGE);    
            

        const topProductsWithRevenue = topProducts.map(product => {
            return {
                ...product.toObject(),
                revenue: product.price * product.sold
            }
        })

        const pendingOrders = await Order.countDocuments({ status: "Pending" });

        res.render('admin/dashboard', {
            totalUsers,
            totalOrders,
            totalSales: totalSales[0]?.total || 0,
            productsSold: productsSold[0]?.totalQty || 0,
            topProducts,
            pendingOrders,
            topProductsWithRevenue,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Something went wrong while fetching dashboard data.');
    }
};


module.exports = {
    renderDashboard
}