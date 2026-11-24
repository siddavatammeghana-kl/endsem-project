
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Account = require("../models/Account");

const router = express.Router();

// USER REGISTRATION
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

       await newUser.save();

// Generate a unique demo account number
const accountNumber =
    "SB" + Date.now().toString().slice(-10);

const newAccount = new Account({
    userId: newUser._id,
    accountNumber: accountNumber,
    balance: 25000,
    accountType: "Savings"
});

await newAccount.save();

res.status(201).json({
    message: "Registration successful. Bank account created.",
    accountNumber: accountNumber
});

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Server error during registration"
        });
    }
});

// USER LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error during login"
        });
    }
});

module.exports = router;
