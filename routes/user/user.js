const express = require('express');
const router = express.Router();
const { uploadUser } = require('../../middlewares/user/multer');
const { userAccount,
        userProfile, 
        userAddress,
        editProfile,
        verifyOldEmail,
        resendOtp,
        verifyOldEmailOtp,
        verifyNewEmail,
        renderOtpPage,
        resendNewEmailOtp, 
        verifyNewEmailOtp,
        updateProfile,
        changePassword,
        addAddressPage,
        addAddress,
        makeDefault,
        deleteAddress,
        editAddressPage,
        editAddress, 
        changeAddress} = require('../../controllers/user/userController');


router.get('/account', userAccount)

router.get('/profile/:id', userProfile);



router.get('/profile/edit/:id', editProfile);

//Email Edit

router.get('/profile/verify-old-email/:id', verifyOldEmail);

router.get('/profile/resend-otp/:id', resendOtp);

router.post('/profile/verify-old-emailOtp/:id', verifyOldEmailOtp);

router.post('/profile/change-email/:id', verifyNewEmail);

router.get('/verify-new-email/:id', renderOtpPage)

router.get('/profile/resend-otp-new/:id', resendNewEmailOtp)

router.post('/profile/verify-new-emailOtp/:id', verifyNewEmailOtp)


//Profile Update 


router.patch('/profile/update', uploadUser.single('image'), updateProfile)


//Edit Password


router.get('/profile/change-password', changePassword);


//Address

router.get('/address', userAddress);

router.get('/address/add', addAddressPage);

router.post('/address/add', addAddress);

router.get('/address/default/:id', makeDefault);

router.get('/address/delete/:id', deleteAddress);

router.get('/address/edit/:id', editAddressPage);

router.patch('/address/edit/:id', editAddress);

router.patch('/address/change', changeAddress)


module.exports = router;