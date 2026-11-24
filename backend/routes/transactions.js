
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const router = express.Router();

// MONEY TRANSFER
router.post("/transfer", async (req, res) => {
    const session = await mongoose.startSession();

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

        const { toAccount, amount } = req.body;
        const transferAmount = Number(amount);

        if (
            !toAccount ||
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0
        ) {
            return res.status(400).json({
                message: "Enter valid account details and amount"
            });
        }

        await session.startTransaction();

        const sender = await Account.findOne({
            userId: decoded.userId
        }).session(session);

        if (!sender) {
            throw new Error("Sender account not found");
        }

        const receiver = await Account.findOne({
            accountNumber: toAccount
        }).session(session);

        if (!receiver) {
            throw new Error("Receiver account not found");
        }

        if (sender._id.equals(receiver._id)) {
            throw new Error("You cannot transfer money to your own account");
        }

        if (sender.balance < transferAmount) {
            throw new Error("Insufficient balance");
        }

        sender.balance -= transferAmount;
        receiver.balance += transferAmount;

        await sender.save({ session });
        await receiver.save({ session });

        const transaction = new Transaction({
            userId: decoded.userId,
            fromAccount: sender.accountNumber,
            toAccount: receiver.accountNumber,
            amount: transferAmount,
         transactionType: "Withdrawal",
            status: "Success"
        });

        await transaction.save({ session });

        await session.commitTransaction();

        res.json({
            message: "Money transferred successfully",
            balance: sender.balance,
            transaction
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error("Transfer error:", error.message);

        res.status(400).json({
            message: error.message || "Transfer failed"
        });

    } finally {
        await session.endSession();
    }
});

// GET TRANSACTION HISTORY
router.get("/history", async (req, res) => {
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

        const transactions = await Transaction.find({
            userId: decoded.userId
        }).sort({ date: -1 });

        res.json({
            transactions
        });

    } catch (error) {
        console.error("Transaction history error:", error.message);

        res.status(401).json({
            message: "Unable to fetch transaction history"
        });
    }
});
// DEPOSIT MONEY
router.post("/deposit", async (req, res) => {
    const session = await mongoose.startSession();

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

        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Enter a valid deposit amount"
            });
        }

        let updatedBalance;

        await session.withTransaction(async () => {
            const account = await Account.findOne({
                userId: decoded.userId
            }).session(session);

            if (!account) {
                throw new Error("Bank account not found");
            }

            account.balance += amount;
            updatedBalance = account.balance;

            await account.save({ session });

            await Transaction.create([{
                userId: decoded.userId,
                fromAccount: "BANK",
                toAccount: account.accountNumber,
                amount: amount,
                transactionType: "Credit",
                status: "Success"
            }], { session });
        });

        res.json({
            message: "Money deposited successfully",
            balance: updatedBalance
        });

    } catch (error) {
        console.error("Deposit error:", error.message);

        res.status(400).json({
            message: error.message || "Deposit failed"
        });
    } finally {
        await session.endSession();
    }
});
// WITHDRAW MONEY
router.post("/withdraw", async (req, res) => {
    const session = await mongoose.startSession();

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

        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "Enter a valid withdrawal amount"
            });
        }

        let updatedBalance;

        await session.withTransaction(async () => {
            const account = await Account.findOne({
                userId: decoded.userId
            }).session(session);

            if (!account) {
                throw new Error("Bank account not found");
            }

            if (account.balance < amount) {
                throw new Error("Insufficient balance");
            }

            account.balance -= amount;
            updatedBalance = account.balance;

            await account.save({ session });

            await Transaction.create([{
                userId: decoded.userId,
                fromAccount: account.accountNumber,
                toAccount: "CASH",
                amount,
                transactionType: "Debit",
                status: "Success"
            }], { session });
        });

        res.json({
            message: "Money withdrawn successfully",
            balance: updatedBalance
        });

    } catch (error) {
        console.error("Withdrawal error:", error.message);

        res.status(400).json({
            message: error.message || "Withdrawal failed"
        });
    } finally {
        await session.endSession();
    }
});
module.exports = router;
