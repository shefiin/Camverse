const Product = require('../../models/product');
const Category = require('../../models/category');
const Brand = require('../../models/brand');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');
const { decodeBase64 } = require('bcryptjs');
const product = require('../../models/product');



const loadProducts = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page -1) * limit


        const filter = {
            $or: [
                { name: { $regex: search, $options: 'i' }},
                { description: { $regex: search, $options: 'i' }}
            ]
        };
    
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

    
        const products = await Product.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('brand');
        

        res.render('admin/products', {
            products,
            currentPage: page,
            totalPages,
            search,
            skip,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null
        });

    } catch (err) {
        console.log(err);
        res.render('admin/products', {
            products: [],
            currentPage: 1,
            totalPages: 1,
            search: '',
            prevPage: null,
            nextPage: null,
        });
    }

};


const loadAddProductPage = async (req, res) => {
    try {
        const brands = await Brand.find({isDeleted: {$ne: true }, status: 'Active'});
        const categories = await Category.find({isDeleted: {$ne: true }, status: 'Active'});
        const messages = req.flash();

        res.render('admin/add-product', {
            brands,
            categories,
            messages
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong while loading add product page.');
    }
};


const addProductValidation = async (req, res) => {
    try {
        const { name, brand, category, price, mrp, stock, description,  } = req.body;

        if (
            !name || !brand || !category || !price || !stock || !description) {
            return res.status(400).send('All fields are required');
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('At least one image is required');
        }

        if(req.files.length > 10) {
            return res.status(400).send('You can upload a maximum of 10 images');
        }


        const priceNum = Number(price);
        const mrpNum = mrp? Number(mrp) : null;
        const stockNum = Number(stock);

        if (
            typeof name !== 'string' ||
            typeof brand !== 'string' ||
            typeof category !== 'string' ||
            isNaN(priceNum) || priceNum < 0 ||
            (mrpNum !== null && (isNaN(mrpNum) || mrpNum <= 0)) ||
            isNaN(stockNum) || stockNum < 0
        ) {
            return res.status(400).send('Invalid data');
        }

        if (mrpNum !== null && mrpNum <= priceNum) {
            return res.status(400).send('MRP must be greater than price')
        }

        req.body.name = name.trim();
        req.body.description = description ? description.trim() : '';

        const categoryExists = await Category.findOne({_id: category});
        if(!categoryExists) {
            return res.status(400).json({ error: 'Category does not exist' });
        }

        const brandExists = await Brand.findOne({ _id: brand });
        if (!brandExists) {
            return res.status(400).json({ error: 'Brand does not exist' });
        }


        const images = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        const newProduct = new Product({
            name: req.body.name.trim(), 
            brand, 
            category,
            price: priceNum,
            mrp: mrpNum,
            stock: stockNum,
            description: req.body.description.trim(),
            images
        });

        await newProduct.save();
       
        res.redirect('/admin/products/add?success=1');

    } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong');
    }
}


const loadEditProductPage = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const brands = await Brand.find();
        const categories = await Category.find();

        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.render('admin/edit-product',
             { product,
               images: product.images,
               brands,
               categories
              });
    } catch (error) {
        console.log(error);
        res.status(500).send('Something went wrong while loading edit product page.');
        
} 
};




// const editProductValidation = async (req, res) => {
//     try {
//         const { name, brand, category, price, mrp, stock, description } = req.body;
//         const productId = req.params.id;


//         const existingProduct = await Product.findById(productId);

//         if(!existingProduct){
//             return res.status(404).send('Product not found');
//         }

//         if(!name || !brand || !category || !price || !stock || !description) {
//             return res.status(400).send('All fields are required');
//         }

//         if(req.files && req.files.length > 10){
//             return res.status(400).send('You can upload a maximum of 10 images');
//         }

//         const priceNum = Number(price);
//         const mrpNum = mrp ? Number(mrp) : null;
//         const stockNum = Number(stock);

//         if(
//             typeof name !== 'string' ||
//             typeof brand !== 'string' ||
//             typeof category !== 'string' ||
//             isNaN(priceNum) || priceNum < 0 ||
//             (mrpNum !== null && (isNaN(mrpNum) || mrpNum <=0 )) ||
//             isNaN(stockNum) || stockNum < 0

//         ){
//             return res.status(400).send('Invalid data');
//         }

//         if(mrpNum !== null && mrpNum <= priceNum){
//             return res.status(400).send('MRP must be greater than price')
//         }
        
//         req.body.name = name.trim();
//         req.body.description = description ? description.trim() : '';


//         const categoryExists = await Category.findById({_id: category});
//         if(!categoryExists) {
//             return res.status(400).json({ error: 'Category does not exist'});
//         }

//         const brandExists = await Brand.findById({_id: brand});
//         if(!brandExists) {
//             return res.status(400).json({error: 'Brand does not exist'});
//         }


//         let updatedImages = existingProduct.images || [];
//         if (req.files && req.files.length > 0){
//             const newImages = req.files.map(file => ({
//                 url: file.path,
//                 public_id: file.filename
//             }));
//             updatedImages = [...updatedImages, ...newImages];
//         }

//         existingProduct.name = req.body.name.trim()
//         existingProduct.brand = brand;
//         existingProduct.category = category;
//         existingProduct.price = priceNum;
//         existingProduct.mrp = mrpNum;
//         existingProduct.stock = stockNum;
//         existingProduct.description = req.body.description.trim();
//         existingProduct.images = updatedImages;

//         await existingProduct.save();

//         res.redirect('/admin/products?success=1');

//     } catch(error){
//         console.error(err)
//     }
// }


const editProductValidation = async (req, res) => {
    try {
        const { name, brand, category, price, mrp, stock, description } = req.body;
        const productId = req.params.id;

        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).send('Product not found');
        }

        if (!name || !brand || !category || !price || !stock || !description) {
            return res.status(400).send('All fields are required');
        }

        if (req.files && req.files.length > 10) {
            return res.status(400).send('You can upload a maximum of 10 images');
        }

        const priceNum = Number(price);
        const mrpNum = mrp ? Number(mrp) : null;
        const stockNum = Number(stock);

        if (
            typeof name !== 'string' ||
            typeof brand !== 'string' ||
            typeof category !== 'string' ||
            isNaN(priceNum) || priceNum < 0 ||
            (mrpNum !== null && (isNaN(mrpNum) || mrpNum <= 0)) ||
            isNaN(stockNum) || stockNum < 0
        ) {
            return res.status(400).send('Invalid data');
        }

        if (mrpNum !== null && mrpNum <= priceNum) {
            return res.status(400).send('MRP must be greater than price');
        }

        req.body.name = name.trim();
        req.body.description = description ? description.trim() : '';

        const categoryExists = await Category.findById({ _id: category });
        if (!categoryExists) {
            return res.status(400).json({ error: 'Category does not exist' });
        }

        const brandExists = await Brand.findById({ _id: brand });
        if (!brandExists) {
            return res.status(400).json({ error: 'Brand does not exist' });
        }

        // ----------------- 🔑 IMAGE HANDLING -----------------
        // Parse removed images array from frontend (hidden input)
        const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

        // Start with existing images, filter out removed ones
        let updatedImages = existingProduct.images.filter(
            img => !removedImages.includes(img.url) && !removedImages.includes(img.public_id)
        );

        // Add new uploads if any
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));
            updatedImages = [...updatedImages, ...newImages];
        }

        // -----------------------------------------------------

        existingProduct.name = req.body.name.trim();
        existingProduct.brand = brand;
        existingProduct.category = category;
        existingProduct.price = priceNum;
        existingProduct.mrp = mrpNum;
        existingProduct.stock = stockNum;
        existingProduct.description = req.body.description.trim();
        existingProduct.images = updatedImages;

        await existingProduct.save();

        res.redirect('/admin/products?success=1');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};






const softDeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).send('Product not found');
        }

        res.redirect('/admin/products?success=2');

    } catch (error) {
        console.error('Error soft deleting product:', error);
        res.status(500).send('Something went wrong while soft deleting product.');
    }
        
};


const restoreProduct = async (req, res) => {
    try{
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isDeleted: false },
            { new: true}
        );
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/admin/products?success=3');

    } catch (error) {
        console.error('Error restoring product:', error);
        res.status(500).send('Something went wrong while restoring product.');
    }
}



module.exports = {
    loadProducts,
    loadAddProductPage,
    addProductValidation,
    loadEditProductPage,
    editProductValidation,
    softDeleteProduct,
    restoreProduct
};