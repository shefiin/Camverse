const express = require('express');
const router = express.Router();
const { renderDashboard } = require('../../controllers/admin/dashboardController');
const { checkAdminAuth } = require('../../middlewares/admin/authMiddleware');

router.get('/', checkAdminAuth, renderDashboard);



module.exports = router;