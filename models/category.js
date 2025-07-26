const mongoose = require('mongoose');
const { createIndexes } = require('./admin');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model('Category', categorySchema);