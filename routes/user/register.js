const express = require('express');
const router = express.Router();
const { renderRegisterPage, register } = require('../../controllers/user/registerController');
const { verifyOtp } = require('../../controllers/user/otpVerification');
const ensureAuthenticated  = require('../../middlewares/user/auth');

router.get('/', renderRegisterPage); 

router.post('/', register);

router.get('/verify-otp', (req, res) => {
    const tempUser = req.session.tempUser;

    if (!tempUser || !tempUser.email){
        return res.redirect('/register')
    }
    res.render('user/verify-otp', { email: tempUser.email, error: null });
});

router.post('/verify-otp', verifyOtp);

router.get('/register-success', ensureAuthenticated, (req, res) => {
    res.render('user/register-success');
});



module.exports = router;