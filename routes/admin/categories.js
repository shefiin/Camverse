const express = require('express');
const router = express.Router();
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const { loadAddCategoryPage, 
        addCategoryValidation, 
        getCategories,
        loadEditCategoryPage,
        updateCategory,
        softDeleteCategory,
        restoreCategory } = require('../../controllers/admin/categoryController');



const { uploadCategory } = require('../../middlewares/admin/multer');

router.get('/', checkAdminAuth, getCategories);

router.get('/add', checkAdminAuth, loadAddCategoryPage);

router.post('/add', checkAdminAuth, uploadCategory.single('image'), addCategoryValidation);

router.get('/edit/:id', checkAdminAuth, loadEditCategoryPage);

router.patch('/edit/:id', checkAdminAuth, uploadCategory.single('image'), updateCategory);

router.patch('/delete/:id', checkAdminAuth, softDeleteCategory);

router.patch('/restore/:id', checkAdminAuth, restoreCategory);
    
module.exports = router;