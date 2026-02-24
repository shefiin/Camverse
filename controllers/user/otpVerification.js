const User = require('../../models/user');
const util = require('util');
const Wallet = require('../../models/wallet');
const { applyReferralRewards, normalizeReferralCode } = require('../../utils/referral');

const verifyOtp = async (req, res) => {
    const { otp } = req.body;

    if (Date.now() > Number(req.session.otpExpiry || 0)) {
        return res.render('user/verify-otp', {
            email: req.session.tempUser?.email || '',
            error: 'OTP expired. Please request a new one.'
        });
    }

    if (parseInt(otp) !== req.session.otp) {
        return res.render('user/verify-otp', {
            email: req.session.tempUser?.email || '',
            error: 'Invalid OTP. Please try again.'
        });
    }

    
    if (!req.session.tempUser) {
        return res.redirect('/register'); 
    }

    const tempUserData = req.session.tempUser;

    try {      
        const userData = {
            ...req.session.tempUser,
            authType: 'local',
        };

        const newUser = new User(userData);
        await newUser.save();

        
        console.log('Logging in user:', newUser);
        const login = util.promisify(req.login.bind(req));
        await login(newUser);


        req.session.userId = newUser._id;
        req.session.user = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        };

        console.log(tempUserData);
        

        if (tempUserData?.referralUsed) {
            const referralCode = normalizeReferralCode(tempUserData.referralUsed);
            await applyReferralRewards({
                referralCode,
                newUser,
                UserModel: User,
                WalletModel: Wallet
            });
        }
        
        delete req.session.tempUser;
        delete req.session.otp;
        delete req.session.otpExpiry;
        delete req.session.referral;

        
        return res.redirect('/register/register-success');

    } catch (err) {
        console.error('Error creating user:', err);
        return res.redirect('/register');
    }
};

module.exports = {
    verifyOtp
};
