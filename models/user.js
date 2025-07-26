const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    authType: {
      type: String,  
      enum: ['local', 'google'],
      required: true,
      default: 'local'
    },
    googleId: {
       type: String,
       unique: true,
       sparse: true 
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        default: null,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return this.authType === 'local';
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    otp: String,
    otpExpiry: Date,

    profileImage: {
        type: String,
        default: '<i class="fa fa-user"></i>'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
      }    

});


userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


module.exports = mongoose.model('User', userSchema);
