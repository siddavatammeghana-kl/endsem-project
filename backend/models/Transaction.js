
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fromAccount: {
        type: String,
        required: true
    },

    toAccount: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    transactionType: {
        type: String,
        default: "Debit"
    },

    status: {
        type: String,
        default: "Success"
    },

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);
