const Product = require('../../models/product');
const Category = require('../../models/category');
const Brand = require('../../models/brand');


const renderOfferPage = async (req, res) => {
    try {
        const brands = await Brand.find();
        const categories = await Category.find();


        res.render('admin/offers/offers');

    } catch(error){
        console.error(error);
        res.status(400).send('some error while rendering the offer page');
    }
};



const renderProductOffer = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit

        const products = await Product.find({ isDeleted: false })
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('brand');

        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/offers/productOffer', {
            products,
            currentPage: page,
            totalPages,
            skip,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        });

    } catch(error){
        console.error(error);
        res.status(400).send('some error while rendering renderProductOffer')
    }
};


const addOffer = async (req, res) => {
    try {
        const { offerType, offerValue, startDate, endDate } = req.body;
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if(!product) {
            return res.status(404).send('no such product');
        }

        product.individualOffer = {
            discountType: offerType.toUpperCase(),
            discountValue: offerValue,
            startDate,
            endDate,
            isActive: true
        };

        await product.save();

        res.redirect('/admin/offers/product');
        
    } catch(error){
        console.error(error);
        res.status(500).send('some error while adding the offer');
    }
};


const deleteOffer = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findByIdAndUpdate(
            productId,
            { $unset: { individualOffer: "" } },
            { new: true }
          );

        if(!product) {
            return res.status(404).send('no such product');
        }

        res.redirect('/admin/offers/product');

    } catch(error){
        console.error(error);
        res.status(500).send('some error while adding the offer');
    }   
};


const renderCategoryOffer = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const categories = await Category.find({isDeleted: false})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)

        const totalCategories = await Category.countDocuments({ isDeleted: false });
        const totalPages = Math.ceil(totalCategories / limit);  
        
        

        res.render('admin/offers/categoryOffer', {
            categories,
            currentPage: page,
            totalPages,
            skip,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        });

    } catch(error){
        console.error(error);
        res.status(500).send('server error while rendering renderCategoryOffer')
    }
};


const addCategoryOffer = async (req, res) => {
    try{
        const { offerType, offerValue, startDate, endDate } = req.body;
        const categoryId = req.params.id;
        const category = await Category.findByIdAndUpdate(categoryId,
            {$set: {individualOffer: {
                discountType: offerType.toUpperCase(),
                discountValue: offerValue,
                startDate,
                endDate,
                isActive: true
            }}},
            { new: true }
        );

        if(!category) {
            return res.status(404).send('no such product');
        }

        res.redirect('/admin/offers/category');

    } catch(error){
        console.error(error);
        res.status(500).send('some error while adding the offer');
    }   
}






module.exports = {
    renderOfferPage,
    renderProductOffer,
    addOffer,
    deleteOffer,
    renderCategoryOffer,
    addCategoryOffer
}