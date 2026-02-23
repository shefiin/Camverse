const checkAdminAuth = (req, res, next) => {
    if(req.session && req.session.adminId){
        next();
    } else {
        res.redirect('/admin/login');
    }
};

const checkAdminNotAuth = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    next();
};


module.exports = {
    checkAdminAuth,
    checkAdminNotAuth
}
