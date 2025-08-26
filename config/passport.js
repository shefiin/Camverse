const passport = require('passport');
const User = require('../models/user')
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

async (accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value});
    
            if(user) {
                if (user.isBlocked) {
                    return done(null, false, { message: 'Your account is blocked by admin.' });
                }

                user.googleId = profile.id;
                await user.save()
            } else {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    authType: 'google',
                });
            }
    
        } else {
            if (user.isBlocked) {
                return done(null, false, { message: 'Your account is blocked by admin.' });
            }       
        }

        return done(null, user);

    } catch(error){
      return done(error)

    }
  
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err){
        done(err);
    }

})
