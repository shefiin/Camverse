const express = require('express');
const router = express.Router();
const { login } = require('../../controllers/user/authController')
const { redirectIfLoggedIn } = require('../../middlewares/user/auth')

const getSafeRedirectPath = (redirectTo) => {
    if (typeof redirectTo !== 'string') return '';
    const trimmed = redirectTo.trim();
    if (!trimmed.startsWith('/')) return '';
    if (trimmed.startsWith('//')) return '';
    if (trimmed.startsWith('/login')) return '';
    return trimmed;
};

router.get('/', redirectIfLoggedIn, (req, res) => {
    const error = req.flash('error');
    const redirectTarget = getSafeRedirectPath(req.query.redirect);
    const queryError = typeof req.query.error === 'string' ? req.query.error : null;
    res.render('user/login', {
        errorMessage: error.length > 0 ? error[0] : queryError,
        redirectTarget
    });
});


router.post('/', login);



// router.post('/', (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err) return next(err);
//         if (!user) {
//             // Authentication failed - render login page with error
//             return res.render('user/login', { error: info.message });
//         }

//         req.logIn(user, (err) => {
//             if (err) return next(err);
//             return res.redirect('/');
//         });
//     })(req, res, next);
// });



module.exports = router;
