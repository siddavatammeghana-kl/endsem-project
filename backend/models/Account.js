
const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    accountNumber: {
        type: String,
        required: true,
        unique: true
    },

    balance: {
        type: Number,
        default: 25000
    },

    accountType: {
        type: String,
        default: "Savings"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Account", accountSchema);
