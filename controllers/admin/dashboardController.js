const User = require('../../models/user');
const Order = require('../../models/order');
const Product = require('../../models/product');


const  ITEMS_PER_PAGE = 5

const renderDashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page -1) * ITEMS_PER_PAGE;
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const eightWeeksAgo = new Date(now);
        eightWeeksAgo.setDate(now.getDate() - (7 * 7));
        const fiveYearsAgo = new Date(now.getFullYear() - 4, 0, 1);

        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const deliveredItemsBasePipeline = [
            { $unwind: "$products" },
            { $match: { "products.status": "Delivered" } }
        ];

        const totalSales = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
                }
            }
        ]);

        const productsSold = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            { $group: { _id: null, totalQty: { $sum: "$products.quantity" } } }
        ]);

        const topProductsAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            {
                $group: {
                    _id: "$products.productId",
                    sold: { $sum: "$products.quantity" },
                    revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
                }
            },
            { $sort: { sold: -1, revenue: -1 } },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE }
        ]);

        const totalTopProductsAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            { $group: { _id: "$products.productId" } },
            { $count: "count" }
        ]);

        const productIds = topProductsAgg.map((item) => item._id);
        const products = await Product.find({ _id: { $in: productIds } })
            .populate("category")
            .lean();
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        const topProductsWithRevenue = topProductsAgg.map((item) => {
            const product = productMap.get(item._id.toString()) || {};
            return {
                _id: item._id,
                name: product.name || "Unknown Product",
                images: product.images || [],
                category: product.category || null,
                price: product.price || 0,
                sold: item.sold || 0,
                revenue: Math.round(item.revenue || 0)
            };
        });

        const totalTopProducts = totalTopProductsAgg[0]?.count || 0;
        const totalPages = Math.max(1, Math.ceil(totalTopProducts / ITEMS_PER_PAGE));

        const pendingPlacedProducts = await Order.aggregate([
            { $unwind: "$products" },
            { $match: { "products.status": "Placed" } },
            { $group: { _id: null, totalQty: { $sum: "$products.quantity" } } }
        ]);

        const pendingOrders = pendingPlacedProducts[0]?.totalQty || 0;

        const topCategoriesAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDoc"
                }
            },
            { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDoc.category",
                    foreignField: "_id",
                    as: "categoryDoc"
                }
            },
            { $unwind: { path: "$categoryDoc", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$categoryDoc._id",
                    name: { $first: { $ifNull: ["$categoryDoc.name", "Unknown"] } },
                    sold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 6 }
        ]);

        const topBrandsAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDoc"
                }
            },
            { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "brands",
                    localField: "productDoc.brand",
                    foreignField: "_id",
                    as: "brandDoc"
                }
            },
            { $unwind: { path: "$brandDoc", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$brandDoc._id",
                    name: { $first: { $ifNull: ["$brandDoc.name", "Unknown"] } },
                    sold: { $sum: "$products.quantity" }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 6 }
        ]);

        const monthlySalesAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            { $addFields: { saleDate: { $ifNull: ["$deliveredAt", "$orderDate"] } } },
            { $match: { saleDate: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$saleDate" },
                        month: { $month: "$saleDate" }
                    },
                    revenue: {
                        $sum: { $multiply: ["$products.price", "$products.quantity"] }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const weeklySalesAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            { $addFields: { saleDate: { $ifNull: ["$deliveredAt", "$orderDate"] } } },
            { $match: { saleDate: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$saleDate" },
                        week: { $isoWeek: "$saleDate" }
                    },
                    revenue: {
                        $sum: { $multiply: ["$products.price", "$products.quantity"] }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } }
        ]);

        const yearlySalesAgg = await Order.aggregate([
            ...deliveredItemsBasePipeline,
            { $addFields: { saleDate: { $ifNull: ["$deliveredAt", "$orderDate"] } } },
            { $match: { saleDate: { $gte: fiveYearsAgo } } },
            {
                $group: {
                    _id: { year: { $year: "$saleDate" } },
                    revenue: {
                        $sum: { $multiply: ["$products.price", "$products.quantity"] }
                    }
                }
            },
            { $sort: { "_id.year": 1 } }
        ]);

        const analytics = {
            categories: {
                labels: topCategoriesAgg.map((item) => item.name),
                data: topCategoriesAgg.map((item) => item.sold)
            },
            brands: {
                labels: topBrandsAgg.map((item) => item.name),
                data: topBrandsAgg.map((item) => item.sold)
            },
            monthlySales: {
                labels: monthlySalesAgg.map((item) => `${item._id.year}-${String(item._id.month).padStart(2, "0")}`),
                data: monthlySalesAgg.map((item) => Math.round(item.revenue || 0))
            },
            weeklySales: {
                labels: weeklySalesAgg.map((item) => `${item._id.year}-W${String(item._id.week).padStart(2, "0")}`),
                data: weeklySalesAgg.map((item) => Math.round(item.revenue || 0))
            },
            yearlySales: {
                labels: yearlySalesAgg.map((item) => String(item._id.year)),
                data: yearlySalesAgg.map((item) => Math.round(item.revenue || 0))
            }
        };

        res.render('admin/dashboard', {
            totalUsers,
            totalOrders,
            totalSales: totalSales[0]?.total || 0,
            productsSold: productsSold[0]?.totalQty || 0,
            top20Products : [],
            pendingOrders,
            topProductsWithRevenue,
            totalPages,
            currentPage: page,
            skip,
            analytics
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Something went wrong while fetching dashboard data.');
    }
};



module.exports = {
    renderDashboard
}
