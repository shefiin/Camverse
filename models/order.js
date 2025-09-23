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
                enum: ["Pending", 
                       "Placed", 
                       "Shipped", 
                       "Out for delivery", 
                       "Delivered", 
                       "Cancelled", 
                       "Return in process", 
                       "Returned"
                    ],

                default: "Pending"
            },
            cancelReason: { type: String },
            returnReason: { type: String },
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

    totalQuantity: {
        type: Number,
        required: true
    },

    grossAmount: {
        type: Number,
        required: true
    },

    totalDiscount: {
        type: Number,
        required: true
    },

    totalAmount: {
        type: Number,
        required: true,
    },

    paymentMethod: {
        type: String,
        enum: ['Cash on delivery', 'Online', 'Wallet'],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'  
    },
    status: {
        type: String,
        enum: ["Placed", 
               "Shipped", 
               "Out for delivery", 
               "Delivered", 
               "Cancelled", 
               "Returned"
            ],
            
        default: "Placed"
    },
    cancelReason: { type: String },
    returnReason: { type: String },
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