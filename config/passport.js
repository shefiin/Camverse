const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
            authType: 'google',
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profileImage: profile.photos[0].value
        });

        return done(null, newUser);
    }   catch (err){
        return done(err);
    }
}));



passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',        
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email, authType: 'local' });
            if (!user){
                return done(null, false, { message: 'No user found with this email'});
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch){
                return done(null, false, { message: 'Incorrect password'});
            }

            return done(null, user);
        }   catch (err){
            return done(err);
        }
    }
));


passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user); 
});


module.exports = passport;
