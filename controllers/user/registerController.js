const bcrypt = require('bcrypt');
const User = require('../../models/user');
const sendOTP = require('../../utils/sendEmail');


const renderRegisterPage = (req, res) => {
    res.render('user/register', { error: null, formData: {} });
};


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};


const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

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

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        req.session.tempUser = {
            name,
            email,
            password: hashedPassword
        };

        req.session.otp = otp;

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


module.exports = {
    renderRegisterPage,
    register
};



