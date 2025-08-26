const express = require('express');
const router = express.Router();
const { login } = require('../../controllers/user/authController')
const { redirectIfLoggedIn } = require('../../middlewares/user/auth')

router.get('/', redirectIfLoggedIn, (req, res) => {
    const error = req.flash('error');
    res.render('user/login', { errorMessage: error.length > 0 ? error[0] : null});
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