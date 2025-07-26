const mongoose = require('mongoose');
const category = require('./category');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true 
    },
    image: {
        type: [String],
        required: true,
        default: []
    },
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('Product', productSchema);