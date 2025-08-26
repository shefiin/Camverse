const express = require('express');
const { logout } = require('../../controllers/user/authController');
const router = express.Router();


router.get('/', logout)


module.exports = router;