const express = require('express');
const router = express.Router();
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const { loadAddBrandPage,
       addBrandValidation, 
       getBrands,
       loadEditBrandPage,
       updateBrand,
       softDeleteBrand,
       restoreBrand } = require('../../controllers/admin/brandController');

const { uploadBrand } = require('../../middlewares/admin/multer');


router.get('/', checkAdminAuth, getBrands);

router.get('/add', checkAdminAuth, loadAddBrandPage);

router.post('/add', checkAdminAuth, uploadBrand.single('image'), addBrandValidation);

router.get('/edit/:id', checkAdminAuth, loadEditBrandPage);

router.patch('/edit/:id', checkAdminAuth, uploadBrand.single('image'), updateBrand);

router.patch('/delete/:id', checkAdminAuth, softDeleteBrand);

router.patch('/restore/:id', checkAdminAuth, restoreBrand);


module.exports = router;




