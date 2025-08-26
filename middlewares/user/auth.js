function requiredLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }

    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}


function redirectIfLoggedIn(req, res, next) {
    if(req.session.userId){
        return res.redirect('/');
    }
    next();
}

module.exports = {requiredLogin, redirectIfLoggedIn}