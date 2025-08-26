const express = require('express');
const router = express.Router();
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const { 
    loadProducts,
    loadAddProductPage,
    addProductValidation,
    loadEditProductPage,
    editProductValidation,
    softDeleteProduct, 
    restoreProduct} = require('../../controllers/admin/productsController');

const { uploadProduct } = require('../../middlewares/admin/multer');



router.get('/', checkAdminAuth, loadProducts);

router.get('/add', checkAdminAuth, loadAddProductPage);

router.post('/add', checkAdminAuth, uploadProduct.array('images', 10), addProductValidation);

router.get('/edit/:id', checkAdminAuth, loadEditProductPage);

router.patch('/edit/:id', checkAdminAuth, uploadProduct.array('images', 10), editProductValidation)

router.patch('/delete/:id', checkAdminAuth, softDeleteProduct)

router.patch('/restore/:id', checkAdminAuth, restoreProduct);    



module.exports = router;