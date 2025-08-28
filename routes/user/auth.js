const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.session.userId = req.user._id;
        req.session.user = {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email
        };
    
        res.redirect('/');
    }
);


module.exports = router;
