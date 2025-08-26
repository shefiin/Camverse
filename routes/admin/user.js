const express = require('express');
const router = express.Router();
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const {
    getUsers,
    blockUser,
    unblockUser } = require('../../controllers/admin/userController');



router.get('/', checkAdminAuth, getUsers);

router.patch('/block/:id', checkAdminAuth, blockUser);

router.patch('/unblock/:id', checkAdminAuth, unblockUser);




module.exports = router;