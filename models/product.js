const mongoose = require('mongoose');
const category = require('./category');
const brand = require('./brand');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    price: {
        type: Number,
        required: true 
    },
    mrp: {
        type: Number,
        default: null
    },
    images: [
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
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    sold: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }, 
}, {
    timestamps: true,

});


module.exports = mongoose.model('Product', productSchema);