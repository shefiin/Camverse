const User = require('../../models/user');
const util = require('util');

const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    
    if(parseInt(otp) !== req.session.otp) {
        return res.render('user/verify-otp', {
            email: req.session.tempUser.email,
            error: 'Invalid OTP. Please try again.'
        });          
    }

    try {
        const newUser = new User(req.session.tempUser);
        await newUser.save();
        
        const login = util.promisify(req.login.bind(req));
        await login(newUser);
    
        delete req.session.tempUser;
        delete req.session.otp;
    
        return res.redirect('/register/register-success');

    } catch (err) {
        console.log('Error creating user:', err);
        return res.redirect('/register');
    }
    

};

module.exports = {
    verifyOtp
}