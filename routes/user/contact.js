const express = require('express');
const router = express.Router();
const { renderContactPage, submitContactForm } = require('../../controllers/user/homeController');

router.get('/', renderContactPage);
router.post('/', submitContactForm);

module.exports = router;
