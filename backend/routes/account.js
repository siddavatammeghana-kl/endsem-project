
const express = require("express");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const router = express.Router();

// Get logged-in user's bank account
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const account = await Account.findOne({
            userId: decoded.userId
        });

        if (!account) {
            return res.status(404).json({
                message: "Bank account not found"
            });
        }

        res.json({
            accountNumber: account.accountNumber,
            balance: account.balance,
            accountType: account.accountType
        });

    } catch (error) {
        console.error("Account error:", error.message);

        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
});

module.exports = router;
