const Coupon = require('../../models/coupon');



const renderCouponPage = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit

        const coupons = await Coupon.find({ isDeleted: false })
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)

        const totalCoupons = await Coupon.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalCoupons / limit);    

        res.render('admin/coupon/coupons', {
            coupons,
            currentPage: page,
            totalPages,
            skip,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        });
    } catch (error){
        console.error(error);
        res.status(500).send('some error');
    }
};


const addCoupon = async (req, res) => {    

    try {
        const { discountType, couponName, description, discountValue, startDate, endDate } = req.body;

        const coupon = new Coupon({
            name: couponName.toUpperCase(),
            description: description,
            discountType: discountType,
            discountValue: discountValue,
            startDate: startDate,
            endDate: endDate
        })

        await coupon.save();

        res.redirect('/admin/coupons');

    } catch(error){
        console.error(error);
        res.status(500).send('something went wrong while adding the coupon');
    }
};




module.exports = {
    renderCouponPage,
    addCoupon
}

