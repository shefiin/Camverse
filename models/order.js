const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                requires: true
            }
        }
    ],


    shippingAddress: {
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },

    totalAmount: {
        type: Number,
        required: true,
    },

    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'  
    },

    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },

    orderDate: {
        type: Date,
        default: Date.now
    }    
});

module.exports = mongoose.model('Order', orderSchema);