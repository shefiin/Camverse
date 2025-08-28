const express = require('express');
const router = express.Router();
const { renderRegisterPage, register, resendOtp } = require('../../controllers/user/authController');
const { verifyOtp } = require('../../controllers/user/otpVerification');
const { requiredLogin, redirectIfLoggedIn }  = require('../../middlewares/user/auth');

router.get('/', redirectIfLoggedIn, renderRegisterPage); 

router.post('/', register);

router.get('/verify-otp', (req, res) => {
    const tempUser = req.session.tempUser;

    if (!tempUser || !tempUser.email){
        return res.redirect('/register')
    }
    res.render('user/verify-otp', { 
        email: tempUser.email, 
        error: null, 
        remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000)
    });
});

router.get('/resend-otp', resendOtp);

router.post('/verify-otp', verifyOtp);

router.get('/register-success', requiredLogin, (req, res) => {
    res.render('user/register-success', {
        user: req.session.user,
    })
});



module.exports = router;