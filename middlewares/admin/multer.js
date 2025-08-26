const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary')



const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);      
    } else {
        cb(new Error('Only .jpeg .png .webp images are allowed'), false);   
    }
};

const limits = { fileSize: 2 * 1024 * 1024 };

const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        allowedFormats: ['jpg', 'png', 'webp'],

    }
});

const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'categories',
        allowedFormats: ['jpg', 'png', 'webp'],
    }    
}); 

const brandStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'brands',
        allowedFormats: ['jpg', 'png', 'webp'],
    }    
});

const userStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'users',
        allowedFormats: ['jpg', 'png', 'webp'],
    }
});


const uploadProduct = multer({
    storage: productStorage,   
    fileFilter,
    limits
});
const uploadCategory = multer({
    storage: categoryStorage,    
    fileFilter,
    limits
});
const uploadBrand = multer({
    storage: brandStorage,   
    fileFilter,
    limits
});
const uploadUser = multer({
    storage: userStorage,
    fileFilter,
    limits
});




module.exports = {
    uploadProduct,
    uploadCategory,
    uploadBrand
};