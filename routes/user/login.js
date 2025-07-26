const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res) => {
    const error = req.flash('error');
    res.render('user/login', { errorMessage: error.length > 0 ? error[0] : null});
});



router.post('/', (req, res, next) => {
    passport.authenticate('local',(err, user, info) => {
        if(err) return next(err);
        if(err) return res.render('user/login', { error: info.message });
        

        req.logIn(user, (err) => {
            if(err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
    
});
    


module.exports = router;