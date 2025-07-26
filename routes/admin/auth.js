const express = require('express');
const router = express.Router();
const {renderLoginPage, loginAdmin} = require('../../controllers/admin/adminController');
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const { logoutAdmin } = require('../../controllers/admin/adminController');


router.use((req, res, next) => {
    res.set('Cache-control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
})

router.get('/login', renderLoginPage);
router.post('/login', loginAdmin);

router.get('/logout', logoutAdmin);



// router.get('/create-admin', async (req, res) => {
//     const bcrypt = require('bcryptjs');
//     const Admin = require('../../models/admin');

//     try {
//         const existing = await Admin.findOne({email: 'admin@123.com'});
//         if(existing) return res.status(400).json({message: 'Admin already exists'});

//         const hashedPassword = await bcrypt.hash('admin@123', 10);

//         const newAdmin = new Admin({
//             email: 'admin@123.com',
//             password: hashedPassword
//         });

//         await newAdmin.save();
//         res.status(201).json({message: 'Admin created successfully'});
//     }   catch (error){
//         console.error(error);
//         res.status(500).jsom({message: 'Server error'});
//     }
// })


module.exports = router;