const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },

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
                required: true
            },
            status: {
                type: String,
                enum: ["Placed", "Shipped", "Out for delivery", "Delivered", "Cancelled", "Return in process", "Returned"],
                default: "Placed"
            },
            cancelledAt: Date
        }
    ],


    shippingAddress: {
        fullName: String,
        mobile: String,
        pincode: String,
        house: String,
        area: String,
        landmark: String,
        city: String,
        state: String,        
    },

    totalAmount: {
        type: Number,
        required: true,
    },

    paymentMethod: {
        type: String,
        enum: ['Cash on delivery', 'Online'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'pending'  
    },
    status: {
        type: String,
        enum: ["Placed", "Shipped", "Out for delivery", "Delivered", "Cancelled", "Returned"],
        default: "Placed"
      },
      placedAt: { type: Date, default: Date.now },
      shippedAt: Date,
      outForDeliveryAt: Date,
      deliveredAt: Date,
      cancelledAt: Date,
      returnedAt: Date,
    
    orderDate: {
        type: Date,
        default: Date.now
    }    

});


module.exports = mongoose.model('Order', orderSchema);