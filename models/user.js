const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    pincode: { type: String, required: true },
    house: { type: String, required: true },   
    area: { type: String, required: true },    
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isDefault: {type: Boolean, dafault: false}
  }, { timestamps: true });
  

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
    lastName: {
        type: String,
        trim: true,
        default: null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
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
    status: {
        type: String,
        enum: ['Active', 'Blocked', 'Deleted'],
        default: 'Active'
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
    isDeleted: {
        type: Boolean,
        default: false
    }, 
    isAdmin: {
        type: Boolean,
        default: false
    },

    addresses: [addressSchema],

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
