const Coupon = require('../../models/coupon');

const normalizeCouponName = (name = '') => name.trim().toUpperCase();


const renderCouponPage = async (req, res) => {
    try {
        const now = new Date();
        await Coupon.updateMany(
            { endDate: { $lt: now }, status: 'ACTIVE' },
            { $set: { status: 'INACTIVE' } }
        );

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit

        const coupons = await Coupon.find({})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)

        const totalCoupons = await Coupon.countDocuments({});
        const totalPages = Math.ceil(totalCoupons / limit);    
        const couponError = req.query.couponError || '';

        res.render('admin/coupon/coupons', {
            coupons,
            currentPage: page,
            totalPages,
            couponError,
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
        const normalizedName = normalizeCouponName(couponName);
        if (!normalizedName) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+is+required');
        }

        const existingCoupon = await Coupon.findOne({ name: normalizedName });
        if (existingCoupon) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+already+exists');
        }

        const coupon = new Coupon({
            name: normalizedName,
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
        if (error?.code === 11000) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+already+exists');
        }
        res.status(500).send('something went wrong while adding the coupon');
    }
};

const editCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { discountType, couponName, description, discountValue, minPurchase, startDate, endDate } = req.body;
        const normalizedName = normalizeCouponName(couponName);
        if (!normalizedName) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+is+required');
        }

        const coupon = await Coupon.findById(id);
        if (!coupon || coupon.isDeleted) {
            return res.status(404).send('Coupon not found');
        }

        const duplicate = await Coupon.findOne({
            _id: { $ne: id },
            name: normalizedName
        });
        if (duplicate) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+already+exists');
        }

        coupon.name = normalizedName;
        coupon.description = description;
        coupon.discountType = discountType;
        coupon.discountValue = discountValue;
        coupon.minPurchase = Number(minPurchase) || 0;
        coupon.startDate = startDate;
        coupon.endDate = endDate;
        coupon.status = new Date(endDate) < new Date() ? "INACTIVE" : "ACTIVE";

        await coupon.save();
        return res.redirect('/admin/coupons');
    } catch (error) {
        console.error(error);
        if (error?.code === 11000) {
            return res.redirect('/admin/coupons?couponError=Coupon+name+already+exists');
        }
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

const restoreCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).send("Coupon not found");
        }

        coupon.isDeleted = false;
        coupon.status = new Date(coupon.endDate) < new Date() ? "INACTIVE" : "ACTIVE";
        await coupon.save();

        return res.redirect("/admin/coupons");
    } catch (error) {
        console.error(error);
        return res.status(500).send("something went wrong while restoring the coupon");
    }
};

module.exports = {
    renderCouponPage,
    addCoupon,
    editCoupon,
    deleteCoupon,
    restoreCoupon
}
