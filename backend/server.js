
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/account", require("./routes/account"));
app.use("/api/transactions", require("./routes/transactions"));

// Connect MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("Online Banking Backend is Running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
