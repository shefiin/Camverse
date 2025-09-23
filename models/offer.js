const { default: mongoose } = require("mongoose");

const offerSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    discountType: { 
        type: String, 
        enum: ["PERCENTAGE", "FLAT"], 
        required: true 
    },
    discountValue: { 
        type: Date, 
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
});

module.exports = mongoose.model('Offer', offerSchema);