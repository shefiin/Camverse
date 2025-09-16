const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
});

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [wishlistItemSchema],
    total: {
        type: Number,
        default: 0
    }
},{ timestamps: true });


module.exports = mongoose.model("Wishlist", wishlistSchema);



















































