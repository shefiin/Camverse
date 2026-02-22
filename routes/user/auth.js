const express = require('express');
const passport = require('passport');
const router = express.Router();

const getSafeRedirectPath = (redirectTo) => {
    if (typeof redirectTo !== 'string') return null;
    const trimmed = redirectTo.trim();
    if (!trimmed.startsWith('/')) return null;
    if (trimmed.startsWith('//')) return null;
    if (trimmed.startsWith('/login')) return null;
    return trimmed;
};

router.get('/google',
    (req, res, next) => {
        const safeRedirect = getSafeRedirectPath(req.query.redirect);
        if (safeRedirect) {
            req.session.postLoginRedirect = safeRedirect;
        } else {
            delete req.session.postLoginRedirect;
        }
        next();
    },
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

        const safeRedirect = getSafeRedirectPath(req.session.postLoginRedirect);
        delete req.session.postLoginRedirect;
        res.redirect(safeRedirect || '/');
    }
);


module.exports = router;
