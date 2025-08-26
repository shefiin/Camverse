const mongoose = require('mongoose');


const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
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
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    

}, { timestamps: true });


module.exports = mongoose.model('Brand', brandSchema);