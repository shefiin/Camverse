const express = require('express');
const router = express.Router();
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');
const {
    renderUserManagementPage,
    blockUser,
    unblockUser
} = require('../../controllers/admin/userController');



router.get('/', checkAdminAuth, renderUserManagementPage);
router.post('/:id/block', checkAdminAuth, blockUser);
router.post('/:id/unblock', checkAdminAuth, unblockUser);


module.exports = router;