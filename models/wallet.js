const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    amount: { type: Number, required: true },
    description: { type: String }, 
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, 
    orderItemId: { type: mongoose.Schema.Types.ObjectId },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    createdAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [walletTransactionSchema]
});


module.exports = mongoose.model('Wallet', walletSchema);
