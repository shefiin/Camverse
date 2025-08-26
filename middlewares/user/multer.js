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



const userStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'users',
        allowedFormats: ['jpg', 'png', 'webp'],
    }
});


const uploadUser = multer({
    storage: userStorage,
    fileFilter,
    limits
});




module.exports = {
    uploadUser
};