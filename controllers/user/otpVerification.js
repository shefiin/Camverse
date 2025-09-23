const { underline } = require('pdfkit');
const User = require('../../models/user');
const util = require('util');
const Wallet = require('../../models/wallet');

const verifyOtp = async (req, res) => {
    const { otp } = req.body;
 
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
        

        if(tempUserData?.referralUsed){
            const referralCode = tempUserData.referralUsed;
            console.log("Referral code used:", referralCode);
        
            const referrer = await User.findOne({ referralToken : referralCode });

            if (referrer) {
                let referrerWallet = await Wallet.findOne({ user: referrer._id });
                if (!referrerWallet) {
                    referrerWallet = new Wallet({
                        user: referrer._id,
                        balance: 0,
                        transactions: []
                    });
                }
                referrerWallet.balance += 500;
                referrerWallet.transactions.push({
                    type: 'CREDIT',
                    amount: 500,
                    description: `Referral bonus for inviting ${newUser.email}`,
                    date: new Date()
                });
                await referrerWallet.save();
                referrer.totalReferrals += 1;
                referrer.referralEarnings += 500;
                await referrer.save();
        
                // New user wallet
                let newUserWallet = await Wallet.findOne({ user: newUser._id });
                if (!newUserWallet) {
                    newUserWallet = new Wallet({
                        user: newUser._id,
                        balance: 0,
                        transactions: []
                    });
                }
                newUserWallet.balance += 100;
                newUserWallet.transactions.push({
                    type: 'CREDIT',
                    amount: 100,
                    description: 'Bonus for creating account via referral link',
                    date: new Date()
                });
                await newUserWallet.save();

            } else {
                console.warn("Invalid referral code provided:", referralCode);
            }
        }
        
        delete req.session.tempUser;
        delete req.session.otp;
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
