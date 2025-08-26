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

        const top20Products = await Product.find()
            .sort({ sold: -1 })
            .limit(5)
            .populate('category')
            .skip(skip)

        const paginatedProducts = top20Products.slice(skip, skip + ITEMS_PER_PAGE)    
  
        const totalPages = Math.ceil(20 / ITEMS_PER_PAGE);    
            

        const topProductsWithRevenue = top20Products.map(product => {
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
            top20Products : paginatedProducts,
            pendingOrders,
            topProductsWithRevenue,
            totalPages,
            currentPage: page,
            skip
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Something went wrong while fetching dashboard data.');
    }
};


module.exports = {
    renderDashboard
}