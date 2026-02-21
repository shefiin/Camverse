const User = require('../../models/user');


const ensureLoggedIn = (req, res, next) => {
    if(req.session.user || req.session.userId){
        return next();
    }
    res.redirect('/login?error=Please login first');
};




const checkBlocked = async (req, res, next) => {
    const sessionUserId = req.session.userId || (req.session.user && req.session.user._id);
    if(sessionUserId) {
        const freshUser = await User.findById(sessionUserId);

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
