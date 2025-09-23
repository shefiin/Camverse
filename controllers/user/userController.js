const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const sendOTP = require('../../utils/sendEmail');
const Wallet = require('../../models/wallet');
const user = require('../../models/user');


const userAccount = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const brands = await Brand.find();
        const categories = await Category.find();


        res.render('user/user-account', {
            user,
            categories,
            brands,
        })
    } catch(error){
        console.error('error creating', error);
        res.status(500).send('internal server error');
    }
    
};


const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const brands = await Brand.find();
        const categories = await Category.find();

        const referralToken = user.referralToken;
        const referralLink = `http://localhost:3000/register?ref=${referralToken}`;

        const message = `Join me on Camverse! Use my referral code ${referralToken} to sign up and get exclusive discounts! ${referralLink}`;

        const encodedMessage = encodeURIComponent(message);

        res.render('user/user-profile', {
            user,
            brands,
            categories,
            whatsappLink: `https://wa.me/?text=${encodedMessage}`,
            instagramLink: `https://wa.me/?text=${encodedMessage}`,
            twitterLink: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
            facebookLink: `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`
        })
    } catch (error) {
        console.error('something went wrong', error);
        res.status('500').send('server error');
    }
}


const editProfile = async (req, res) => {
    try {
        const users = await User.findById(req.session.userId);
        const brands = await Brand.find();
        const categories = await Category.find();

        res.render('user/edit-profile', {
            users,
            brands,
            categories
        })

    } catch (error) {
        console.error('something went wrong', error);
        res.status('500').send('server error');
    }
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};


const verifyOldEmail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).send('User not found')
        }

        const otp = generateOTP();

        req.session.emailOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(user.email, otp);
        

        res.render('user/verify-old-email', {
            email: user.email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            error: null,
            userId: user._id
        });
        
        
    } catch(error){
        console.error(error);
        res.status(500).send('Something went wrong');
    }
};


const resendOtp = async (req, res) => {
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(400).send('User not found')
        }

        if (Date.now() < req.session.resendAllowedAt) {
            return res.redirect("/user/profile/verify-old-email"); // block early resend
        }

        const newOtp = generateOTP()

        req.session.emailOtp = newOtp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(user.email, newOtp);

        res.render('user/verify-old-email', {
            email: user.email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            error: null,
            userId: user._id
        });

    } catch(error){
        console.error('error', error);
        res.status(500).send('something wrong......')
        
    }
};


const verifyOldEmailOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const { emailOtp, otpExpiry } = req.session;
        const userId = req.params.id;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(400).send('User not found');
        }

        if(Date.now() > otpExpiry){
            return res.render('user/verify-old-email', {
                email: user.email,
                remainingResend:  Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
                error: 'OTP expired. Please request a new one.',
                userId
            });
        }

        if(parseInt(otp.trim()) !== parseInt(emailOtp)){
            return res.render('user/verify-old-email', {
                email: user.email,
                remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
                error: 'Invalid OTP. Please try again.',
                userId 
            });
        }

        delete req.session.emailOtp;
        delete req.session.otpExpiry;

        res.render('user/change-email', {
            userId,
            error: null
        });

    } catch (error) {
        console.error('error', error);
        res.status(500).send('something went wrong');
        
    }
};


const verifyNewEmail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = User.findById(userId)
        const { email } = req.body;

        if (!email) {
            return res.send('Email is required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('user/change-email', {
                error: `An account with this email already exists.`,
                formData: { email }
            });
        }

        const otp = generateOTP();

        req.session.emailOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;
        req.session.newEmail = email;
        req.session.otpUserId = userId;


        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(req.session.newEmail, otp);

        res.redirect(`/user/verify-new-email/${userId}`);

    } catch (error) {
        console.error('error', error);
        res.status(500).send('something went wrong');
        
    }

};


const renderOtpPage = async (req, res) => {
    try {
        const { newEmail, resendAllowedAt, otpUserId, emailOtp } = req.session;

        if (!req.session.emailOtp) {
            return res.redirect('/user/profile'); 
        }

        res.render('user/verify-new-email', {
            email: newEmail,
            remainingResend: Math.ceil((resendAllowedAt - Date.now()) / 1000),
            error: null,
            userId: otpUserId
        });
    
    } catch(error){
        console.error('error', error);
        res.status(500).send('something wrong......')
        
    }
};


const resendNewEmailOtp = async (req, res) => {
    try{

        const email = req.session.newEmail;

        if (Date.now() < req.session.resendAllowedAt) {
            return res.redirect("/user/profile/verify-new-email"); // block early resend
        }

        const newOtp = generateOTP()

        req.session.emailOtp = newOtp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        await new Promise(resolve => req.session.save(resolve));

        await sendOTP(email, newOtp);

        res.render('user/verify-new-email', {
            email,
            remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
            error: null,
            
        });

    } catch(error){
        console.error('error', error);
        res.status(500).send('something wrong......')
        
    }
};


const verifyNewEmailOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const { emailOtp, otpExpiry, newEmail } = req.session;
        const userId = req.params.id;

        const brands = await Brand.find({isDeleted: { $ne: true }});
        const categories = await Category.find({isDeleted: { $ne: true }});

        const user = await User.findById(userId);

        if(!user) {
            return res.status(400).send('User not found');
        }

        if(Date.now() > otpExpiry){
            return res.render('user/verify-new-email', {
                email: newEmail,
                remainingResend:  Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
                error: 'OTP expired. Please request a new one.',
                userId
            });
        }

        if(parseInt(otp.trim()) !== parseInt(emailOtp)){
            return res.render('user/verify-new-email', {
                email: newEmail,
                remainingResend: Math.ceil((req.session.resendAllowedAt - Date.now()) / 1000),
                error: 'Invalid OTP. Please try again.',
                userId 
            });
        }

        user.email = newEmail;
        await user.save();

        delete req.session.emailOtp;
        delete req.session.otpExpiry;
        delete req.session.newEmail;

        await new Promise(resolve => req.session.save(resolve));

        res.redirect(303, `/user/profile/edit/${user._id}`)

    } catch (error) {
        console.error('error', error);
        res.status(500).send('something went wrong');
        
    }
};



// Profile Update


const updateProfile = async (req, res) => {
    try {

        const userId = req.session.user._id;
        const {name, lastName, gender, dateOfBirth, phone } = req.body;
    
        const user = await User.findById(userId);


        if(!user) {
            return res.status(400).send('user not found');
        }

        if(!name) {
            return res.render('user/edit-profile', {
                error: 'Name is required.',
                user: req.body
            });
        }

        user.name = name.trim()
        if (lastName && lastName.trim() !== '') user.lastName = lastName.trim();
        if(gender) user.gender = gender;
        if(dateOfBirth) user.dateOfBirth = dateOfBirth;
        if(phone) user.phone = phone;


        if(req.file && req.file.path){
            user.profileImage = req.file.path;
        }


        await user.save()

        res.redirect(`/user/profile/${user._id}?success=1`);

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Something went wrong.');
    }
}



//Change password


const changePassword = async (req, res) => {
    try {
        const userId = req.session.user._id;

        const user = await User.findById(userId);

        if(!user || user.isBlocked === true){
            req.flash('error', 'User does not exists');
            return res.redirect('/login');
        };

        const otp = generateOTP();

        req.session.otp = otp 
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resendAllowedAt = Date.now() + 30 * 1000;

        await new Promise(resolve => req.session.save(resolve));


        console.log("EMAIL:", process.env.EMAIL);
        console.log("PASSWORD:", process.env.PASSWORD ? "****" : "NOT SET");

        console.log("User found:", user.email);
        console.log("Generated OTP:", otp);

        await sendOTP(user.email, otp);

        console.log("Rendering OTP page...");
        res.render('user/profile/change-password-otp', {
            error: null
        });


    } catch(error){
        console.error('some error', error);
        res.status(400).send('something went wrong');
    }
}



//Address


const userAddress = async (req, res) => {
    try {

        const userId = req.session.userId; 
        const user = await User.findById(userId);
        const brands = await Brand.find();
        const categories = await Category.find();

        res.render('user/user-address', {
            addresses: user.addresses,
            user,
            brands,
            categories
        })

    } catch (error) {
        console.error('something went wrong', error);
        res.status('500').send('server error');
    }
}


const addAddressPage = async (req, res) => {
    try{
        const brands = await Brand.find()
        const categories = await Category.find();

        res.render('user/account/add-address',{
            brands, 
            categories
        });
    } catch(err){
        console.log('error', err);
        return res.status(400).send('something....')
    }
}


const addAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const {name, phone, pincode, flat, area, landmark, town, state, redirectTo } = req.body;

        const user = await User.findById(userId);

        if(!user || user.isBlocked === true){
            req.flash('error', 'User does not exists');
            return res.redirect('/login');
        }

        if(!name || !phone || !pincode || !flat || !area || !town || !state){
            return res.send('All fields are required');
        };

        const newAddress = {
            fullName: name,
            mobile: phone,
            pincode,
            house: flat,
            area,
            landmark,
            city: town,
            state
        };

        user.addresses.push(newAddress);
        await user.save();

        if (redirectTo === 'checkout') {
            return res.redirect('/checkout?success=1');
          } else {
            return res.redirect('/user/address?success=1');
        }
        
    } catch(error){
        console.error('error: ', error);
        res.status(400).send('some error');
    }
}


const makeDefault = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.params.id;

        await User.updateOne(
            {_id: userId },
            { $set: { "addresses.$[].isDefault": false }}
        );

        await User.updateOne(
            { _id: userId, "addresses._id": addressId},
            { $set: {"addresses.$.isDefault": true }}
        );

        res.redirect('/user/address');

    } catch(err) {
        console.error(err);
        res.redirect('/user/address')
    }
};



const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.params.id;

        await User.updateOne(
            {_id: userId },
            { $pull: { addresses: { _id: addressId }}}
        );

        res.redirect('/user/address?success=2');
    } catch(error){
        console.error(error);
        res.status(400).send('something went wrong');
    }
}


const editAddressPage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.params.id;

        const user = await User.findById(userId);
        const address = user.addresses.id(addressId)

        const brands = await Brand.find();
        const categories = await Category.find();

        
        res.render('user/account/edit-address',{
            address,
            user,
            brands,
            categories
        })
    } catch(error){
        console.error(error);
        res.status(400).send('some error');
    }
}


const editAddress = async (req, res) => {
    try{
        const userId = req.session.userId;
        const addressId = req.params.id;

        const {name, phone, pincode, flat, area, landmark, town, state, redirectTo } = req.body;


        let updateFields = {
            "addresses.$.fullName": name,
            "addresses.$.mobile": phone,
            "addresses.$.pincode": pincode,
            "addresses.$.house": flat,
            "addresses.$.city": town,
            "addresses.$.state": state
        }

        if(area && area.trim() !== ''){
            updateFields["addresses.$.area"] = area;
        }
        if(landmark && landmark.trim() !== ''){
            updateFields["addresses.$.landmark"] = landmark;
        }

        await User.updateOne(
            {_id: userId, "addresses._id": addressId},
            { $set: updateFields }
        );

        if (redirectTo === 'checkout') {
            return res.redirect('/checkout?success=3');
          } else {
            return res.redirect('/user/address?success=3');
        }


    } catch(error){
        console.error(error);
        res.status(400).send('some error');
    }
}


const changeAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { addressId } = req.body;

        await User.updateOne(
            { _id: userId, "addresses._id": addressId },
            { $set: { "addresses.$[].isDefault": false } } // remove old default
          );
        
        await User.updateOne(
            { _id: userId, "addresses._id": addressId },
            { $set: { "addresses.$.isDefault": true } }   // set new default
        );

        res.redirect('/checkout');
      
    } catch(error){
        console.error(error);
        res.status(400).send('something error while changing address');
    }
}


//Wallet

const renderWallet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const wallet = await Wallet.findOne({user: userId})
        

        const brands = await Brand.find();
        const categories = await Category.find();

        res.render('user/account/wallet', {
            wallet,
            user,
            brands,
            categories
        })
    } catch(error){
        console.log(error);
        res.status(400).send('some error while rendering the wallet');
    }
}









module.exports = {
    userAccount,
    userProfile,
    userAddress,
    editProfile,
    verifyOldEmail,
    resendOtp,
    verifyOldEmailOtp,
    verifyNewEmail,
    renderOtpPage,
    resendNewEmailOtp,
    verifyNewEmailOtp,
    updateProfile,
    changePassword,
    addAddressPage,
    addAddress,
    makeDefault,
    deleteAddress,
    editAddressPage,
    editAddress,
    changeAddress,
    renderWallet
}