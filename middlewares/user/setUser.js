const User = require('../../models/user');

const setUser = async(req, res, next) => {
    if(req.session.userId){
        try {
            res.locals.user = await User.findById(req.session.userId);
        } catch (err){
            console.log('error fetching user:', err);
            res.locals.user = null
        }
    } else {
        res.locals.user = null
    }
    next();
}

module.exports = setUser;