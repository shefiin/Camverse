const User = require('../../models/user');


const ensureLoggedIn = (req, res, next) => {
    if(req.session.user){
        return next();
    }
    res.redirect('/login?error=Please login first');
};




const checkBlocked = async (req, res, next) => {
    if(req.session.user) {
        const freshUser = await User.findById(req.session.user._id);

        if(!freshUser){
            req.session.destroy(() => {});
            return res.redirect('/login');
        }

        if(freshUser.isBlocked) {
            req.session.destroy(() => {});
            return res.redirect('/login?blocked=true');
        }
    }
    next();
};


module.exports = { ensureLoggedIn, checkBlocked }