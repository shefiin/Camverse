const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        unique: true 
    },
    description: {
        type: String,
        required: true,
    },
    discountType: { 
        type: String, 
        enum: ['FLAT' ,'PERCENTAGE'], 
        required: true 
    },
    discountValue: {
        type: Number, 
        required: true
    },
    minPurchase: {
        type: Number,
        default: 0 
    },
    maxDiscount: {
        type: Number 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    usageLimit: { 
        type: Number, 
        default: 1 
    },
    perUserLimit: {
        type: Number, 
        default: 1
    },
    status: { 
        type: String, 
        enum: ['ACTIVE', 'INACTIVE'], 
        default: 'ACTIVE' 
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
      
}, { timestamps: true });


module.exports = mongoose.model("Coupon", couponSchema);