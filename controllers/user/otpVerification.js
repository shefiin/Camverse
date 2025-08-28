const User = require('../../models/user');
const util = require('util');

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
        
        delete req.session.tempUser;
        delete req.session.otp;

        
        return res.redirect('/register/register-success');

    } catch (err) {
        console.error('Error creating user:', err);
        return res.redirect('/register');
    }
};

module.exports = {
    verifyOtp
};
