const mongoose = require('mongoose');
const { createIndexes } = require('./admin');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    individualOffer: {
        discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], default: "PERCENTAGE" },
        discountValue: { type: Number, default: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        isActive: { type: Boolean, default: false }
    },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    image: [
        {
            url:{
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],   
    isDeleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    

}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);