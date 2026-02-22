const bcrypt = require('bcrypt');
const User = require('../../models/user');
const sendOTP = require('../../utils/sendEmail');
const crypto = require('crypto');

const renderRegisterPage = (req, res) => {
    if (req.query.ref) {
        req.session.referral = req.query.ref;
        req.session.save();
    }
    res.render('user/register', {
        error: null, formData: {},
        referral: req.session.referral || ''
    });
};


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const getSafeRedirectPath = (redirectTo) => {
    if (typeof redirectTo !== 'string') return null;
    const trimmed = redirectTo.trim();
    if (!trimmed.startsWith('/')) return null;
    if (trimmed.startsWith('//')) return null;
    if (trimmed.startsWith('/login')) return null;
    if (trimmed.startsWith('/logout')) return null;
    return trimmed;
};

const isProtectedAfterLogoutPath = (path) => {
    if (typeof path !== 'string') return true;
    const protectedPrefixes = ['/user', '/cart', '/checkout', '/order', '/wishlist'];
    return protectedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
};

const getSafeRefererPath = (req) => {
    const referer = req.get('referer');
    const host = req.get('host');
    if (!referer || !host) return null;

    try {
        const parsed = new URL(referer);
        if (parsed.host !== host) return null;
        return getSafeRedirectPath(`${parsed.pathname}${parsed.search}`);
    } catch (error) {
        return null;
    }
};


const register = async (req, res) => {
    try {       
        const { name, email, password, confirmPassword, linkReferral, manualReferral } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.send('All fields are required');
        }

        if (password !== confirmPassword) {
            return res.send('Passwords do not match');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/register', {
                error: `An account with this email already exists.
                <a href="/login" class="underline text-red-500 hover:text-red-700">Sign in</a> or
                <a href="/reset-password" class="underline text-red-500 hover:text-red-700">reset password</a>.`,
                formData: { name, email }
            });
        }

        // const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();


        function generateReferralToken(){
            const prefix = "CAMRF";

            const randomNum = Math.floor(1000 + Math.random() * 9000);
            return `${prefix}${randomNum}`;
        }

        const referralToken = generateReferralToken();

        const referralUsed = linkReferral || manualReferral || null;

        req.session.tempUser = {
            name,
            email,
            password,
            referralToken,
            referralUsed
        };
        
        console.log(req.session);
        

        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        if (req.body.referral) {
            req.session.referral = req.body.referral;
        }

        await sendOTP(email, otp);
            
        res.redirect('/register/verify-otp');

    } catch (err) {
        console.error(err);
        res.render('user/register', {
            error: 'An error occurred while registering. Please try again.',
            formData: {
                name: req.body.name,
                email: req.body.email
            }
        })
    }
};


const resendOtp = async (req, res) => {
    try {
        const tempUser = req.session.tempUser;
        const email = tempUser.email;

    
        if (!tempUser || !tempUser.email){
            return res.redirect('/register')
        }

        if (Date.now() < req.session.resendAllowedAt) {
            return res.redirect("/register"); // block early resend
        }

        const newOtp = generateOTP()

        req.session.otp = newOtp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(email, newOtp);

        res.render('user/verify-otp', {
            email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            error: null,
            
        });

    } catch(error){
        console.error('error: ', error);
        res.status(400).send('some error');
    }
}


const login = async (req, res) => {
    try{
        const { email, password, redirect } = req.body;
        const trimmedPassword = typeof password === "string" ? password.trim() : "";
        const safeRedirect = getSafeRedirectPath(redirect);
        const loginRedirectUrl = safeRedirect
            ? `/login?redirect=${encodeURIComponent(safeRedirect)}`
            : '/login';

        const user = await User.findOne({ email });
        if(!user) {
            req.flash('error', 'User does not exists');
            return res.redirect(loginRedirectUrl)
        }
        if (user.isBlocked) {
            req.flash('error', 'Your account is blocked');
            return res.redirect(loginRedirectUrl);
        }

        if (!trimmedPassword) {
            req.flash('error', 'Please enter your password');
            return res.redirect(loginRedirectUrl);
        }

        if (!user.password) {
            req.flash('error', 'This account uses Google sign-in. Continue with Google or set a password using reset password.');
            return res.redirect(loginRedirectUrl);
        }

        const isMatch = await bcrypt.compare(trimmedPassword, user.password);

        if(!isMatch){
            req.flash('error', 'Invalid email or password');
            return res.redirect(loginRedirectUrl);
        }

        req.session.userId = user._id;
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
          

        res.redirect(safeRedirect || '/');

    } catch(error){
        console.error('something went wrong while logging', error);
        return res.status(500).send('internal server Error');
    }
};


const logout = (req, res) => {
    const queryRedirect = getSafeRedirectPath(req.query.redirect);
    const refererRedirect = getSafeRefererPath(req);
    const requestedRedirect = queryRedirect || refererRedirect;
    const finalRedirect = requestedRedirect && !isProtectedAfterLogoutPath(requestedRedirect)
        ? requestedRedirect
        : '/';

    req.session.destroy(err => {
        if(err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not logout.')
        }
        res.clearCookie('connect.sid');
        res.redirect(finalRedirect);
    })
}


const renderReset1 = (req, res) => {
    const error = req.flash('error');
    res.render('user/reset-password-mail', 
        { errorMessage: error.length > 0 ? error[0] : null}
    );
}



const checkUserExist = async (req, res) => {
    try{
        const { email } = req.body;
        const now = Date.now();

        if (req.session.resendAllowedAt && now < req.session.resendAllowedAt) {
            const waitSec = Math.ceil((req.session.resendAllowedAt - now) / 1000);
            req.flash('error', `Please wait ${waitSec}s before requesting another OTP`);
            return res.redirect('/reset');
        }

        const user = await User.findOne({email});
    
        if(!user || user.isBlocked === true) {
            req.flash('error', 'User does not exists');
            return res.redirect('/reset')
        }

        const otp = generateOTP();

        req.session.emailOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = now + 30 * 1000;
        req.session.resetEmail = user.email; 

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(user.email, otp);

        res.render('user/reset-otp', {
            email: user.email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            resendAllowedAt: req.session.resendAllowedAt,
            error: null,
            userId: user._id
        });
        
    } catch(error){
        console.log('error', error);
        res.status(400).send('something wrong')
    }



}



// const verifyResetOtp = async (req, res) => {

//     try{
//         const {otp} = req.body;
//         const {otpExpiry, emailOtp, email} = req.session;
//         const user = req.session;
    
//         if(Date.now() > otpExpiry){
//             return res.render('user/reset-otp', {
//                 email: user.email,
//                 remainingResend:  Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
//                 error: 'OTP expired. Please request a new one.',
//                 userId
//             });
//         }
    
//         if(parseInt(otp.trim()) !== parseInt(emailOtp)){
//             return res.render('user/reset-otp', {
//                 email: user.email,
//                 remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
//                 error: 'Invalid OTP. Please try again.',
//             });
//         }

//         delete req.session.emailOtp;
//         delete req.session.otpExpiry;

//         req.session.resetEmail = email;



//         res.render('user/new-password', {
//             user,
//             error: null
//         });

//     } catch(error){
//         console.error('error', error);
//         res.status(400).send('something wrong')
        
//     }

// };


const verifyResetOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const { otpExpiry, emailOtp, resetEmail, resendAllowedAt } = req.session;

        if (!resetEmail) {
            req.flash('error', 'Session expired. Please try again.');
            return res.redirect('/reset');
        }

        if (Date.now() > otpExpiry) {
            return res.render('user/reset-otp', {
                email: resetEmail,
                remainingResend: Math.ceil((resendAllowedAt - Date.now()) / 1000),
                resendAllowedAt,
                error: 'OTP expired. Please request a new one.'
            });
        }

        if (parseInt(otp.trim()) !== parseInt(emailOtp)) {
            return res.render('user/reset-otp', {
                email: resetEmail,
                remainingResend: Math.ceil((resendAllowedAt - Date.now()) / 1000),
                resendAllowedAt,
                error: 'Invalid OTP. Please try again.'
            });
        }

        // OTP is correct — remove it from session
        delete req.session.emailOtp;
        delete req.session.otpExpiry;

        // resetEmail is already in session, don’t overwrite
        res.render('user/new-password', {
            email: resetEmail,  // pass email to template if needed
            error: null
        });

    } catch (error) {
        console.error('error', error);
        res.status(400).send('something wrong');
    }
};



const resetOtpResend = async (req, res) => {
    try {
        const email = req.session.resetEmail;
        const user = await User.findOne({email});
    
        if(!user || user.isBlocked === true) {
            req.flash('error', 'User does not exists');
            return res.redirect('/reset')
        }

        const otp = generateOTP();

        req.session.emailOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;
        req.session.userId = user._id

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(user.email, otp);

        res.render('user/reset-otp', {
            email: user.email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            resendAllowedAt: req.session.resendAllowedAt,
            error: null,
            userId: user._id

        });

    } catch(error){
        console.error('some error', error);
        res.status(400).send('something wrong');
    }
}


const updatePassword = async (req, res) => {
    try {
        const email = req.session.resetEmail; // get email from session

        if (!email) {
            req.flash('error', 'Session expired. Please try again.');
            return res.redirect('/reset');
        }

        const user = await User.findOne({ email });

        if (!user || user.isBlocked) {
            req.flash('error', 'User does not exist');
            return res.redirect('/reset');
        }

        const { newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/reset/new-password');
        }

        // User model pre-save hook already hashes password; assigning plain text avoids double-hashing.
        user.password = newPassword;
        await user.save();

        delete req.session.resetEmail; // clear session after update

        res.redirect('/login');
    } catch (error) {
        console.log('error: ', error);
        res.status(400).send('Some error occurred');        
    }
};





module.exports = {
    renderRegisterPage,
    register,
    login,
    logout,
    renderReset1,
    checkUserExist,
    verifyResetOtp,
    resetOtpResend,
    updatePassword,
    resendOtp
};
