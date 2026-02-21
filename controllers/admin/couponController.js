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
        const { discountType, couponName, description, discountValue, minPurchase, startDate, endDate } = req.body;

        const coupon = new Coupon({
            name: couponName.toUpperCase(),
            description: description,
            discountType: discountType,
            discountValue: discountValue,
            minPurchase: Number(minPurchase) || 0,
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

const editCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountType, couponName, description, discountValue, minPurchase, startDate, endDate } = req.body;

        const coupon = await Coupon.findById(id);
        if (!coupon || coupon.isDeleted) {
            return res.status(404).send('Coupon not found');
        }

        coupon.name = couponName.toUpperCase();
        coupon.description = description;
        coupon.discountType = discountType;
        coupon.discountValue = discountValue;
        coupon.minPurchase = Number(minPurchase) || 0;
        coupon.startDate = startDate;
        coupon.endDate = endDate;

        await coupon.save();
        return res.redirect('/admin/coupons');
    } catch (error) {
        console.error(error);
        return res.status(500).send('something went wrong while updating the coupon');
    }
};




const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).send("Coupon not found");
        }

        coupon.isDeleted = true;
        coupon.status = "INACTIVE";
        await coupon.save();

        return res.redirect("/admin/coupons");
    } catch (error) {
        console.error(error);
        return res.status(500).send("something went wrong while deleting the coupon");
    }
};

module.exports = {
    renderCouponPage,
    addCoupon,
    editCoupon,
    deleteCoupon
}
