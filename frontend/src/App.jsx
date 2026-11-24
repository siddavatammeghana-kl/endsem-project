
import { useState } from "react";
import "./App.css";
import { jsPDF } from "jspdf";

import {
    registerUser,
    loginUser,
    getAccount,
    transferMoney,
    getTransactions,
    depositMoney,
    withdrawMoney
} from "./api";

function App() {
    const [page, setPage] = useState("home");

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loggedIn, setLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [transfer, setTransfer] = useState({
        toAccount: "",
        amount: ""
    });

    const [depositAmount, setDepositAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [loading, setLoading] = useState(false);

    // FORMAT MONEY
    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR"
        });
    };

    // SCROLL TO DASHBOARD SECTION
    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth"
        });
    };

    // REGISTER USER
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = await registerUser(user);

            alert(data.message || "Registration successful!");

            setUser({
                name: "",
                email: "",
                password: ""
            });

            setPage("login");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // LOGIN USER
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = await loginUser({
                email: user.email,
                password: user.password
            });

            localStorage.setItem("token", data.token);

            setCurrentUser(data.user);

            const accountData = await getAccount(data.token);
            setAccount(accountData);

            const transactionData = await getTransactions(data.token);
            setTransactions(transactionData);

            setLoggedIn(true);
            setPage("dashboard");

            setUser({
                name: "",
                email: "",
                password: ""
            });

            alert("Login successful!");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // MONEY TRANSFER
    const handleTransfer = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const amount = Number(transfer.amount);

            if (!transfer.toAccount || amount <= 0) {
                alert("Please enter valid transfer details.");
                return;
            }

            await transferMoney(
                {
                    toAccount: transfer.toAccount,
                    amount: amount
                },
                token
            );

            const accountData = await getAccount(token);
            setAccount(accountData);

            const transactionData = await getTransactions(token);
            setTransactions(transactionData);

            setTransfer({
                toAccount: "",
                amount: ""
            });

            alert("Money transferred successfully!");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // DEPOSIT MONEY
    const handleDeposit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const amount = Number(depositAmount);

            if (amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            await depositMoney(amount, token);

            const accountData = await getAccount(token);
            setAccount(accountData);

            const transactionData = await getTransactions(token);
            setTransactions(transactionData);

            setDepositAmount("");

            alert("Money deposited successfully!");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // WITHDRAW MONEY
    const handleWithdraw = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            const amount = Number(withdrawAmount);

            if (amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            await withdrawMoney(amount, token);

            const accountData = await getAccount(token);
            setAccount(accountData);

            const transactionData = await getTransactions(token);
            setTransactions(transactionData);

            setWithdrawAmount("");

            alert("Money withdrawn successfully!");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // REFRESH ACCOUNT BALANCE
    const handleRefreshBalance = async () => {
        try {
            const token = localStorage.getItem("token");

            const accountData = await getAccount(token);
            setAccount(accountData);

            alert("Balance updated successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    // DOWNLOAD BANK STATEMENT PDF
    const handleDownloadStatement = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("SecureBank - Bank Statement", 20, 20);

        doc.setFontSize(11);

        doc.text(
            `Customer Name: ${currentUser?.name || ""}`,
            20,
            35
        );

        doc.text(
            `Email: ${currentUser?.email || ""}`,
            20,
            43
        );

        doc.text(
            `Account Number: ${account?.accountNumber || ""}`,
            20,
            51
        );

        doc.text(
            `Account Type: ${account?.accountType || ""}`,
            20,
            59
        );

        doc.text(
            `Available Balance: ${formatMoney(account?.balance)}`,
            20,
            67
        );

        doc.setFontSize(14);
        doc.text("Transaction History", 20, 82);

        doc.setFontSize(9);

        let y = 92;

        doc.text("Type", 20, y);
        doc.text("Account", 55, y);
        doc.text("Amount", 115, y);
        doc.text("Date", 155, y);

        y += 8;

        transactions.forEach((item) => {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }

            const type =
                item.transactionType === "Credit"
                    ? "Deposit"
                    : item.transactionType === "Withdrawal"
                    ? "Withdrawal"
                    : "Transfer";

            const accountNo =
                item.transactionType === "Credit"
                    ? item.toAccount
                    : item.transactionType === "Withdrawal"
                    ? item.fromAccount
                    : item.toAccount;

            const amount = `${
                item.transactionType === "Credit" ? "+" : "-"
            }${formatMoney(item.amount)}`;

            const date = new Date(item.date).toLocaleDateString("en-IN");

            doc.text(type, 20, y);
            doc.text(String(accountNo || "-").slice(0, 25), 55, y);
            doc.text(amount, 115, y);
            doc.text(date, 155, y);

            y += 8;
        });

        doc.save("SecureBank_Statement.pdf");
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");

        setLoggedIn(false);
        setCurrentUser(null);
        setAccount(null);
        setTransactions([]);

        setPage("home");

        alert("Logged out successfully!");
    };

    return (
        <div className="app">

            {/* HOME PAGE */}
            {page === "home" && (
                <div className="home-page">

                    <h1>SecureBank</h1>

                    <h2>Welcome to Online Banking System</h2>

                    <p>
                        Manage your money safely and easily.
                    </p>

                    <button onClick={() => setPage("register")}>
                        Register
                    </button>

                    <button onClick={() => setPage("login")}>
                        Login
                    </button>

                </div>
            )}

            {/* REGISTRATION PAGE */}
            {page === "register" && (
                <div className="form-container">

                    <h2>Create Account</h2>

                    <form onSubmit={handleRegister}>

                        <input
                            type="text"
                            placeholder="Enter Your Name"
                            value={user.name}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    name: e.target.value
                                })
                            }
                            required
                        />

                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={user.email}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    email: e.target.value
                                })
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={user.password}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    password: e.target.value
                                })
                            }
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>

                    </form>

                    <p>
                        Already have an account?
                        <button onClick={() => setPage("login")}>
                            Login
                        </button>
                    </p>

                    <button onClick={() => setPage("home")}>
                        Back to Home
                    </button>

                </div>
            )}

            {/* LOGIN PAGE */}
            {page === "login" && (
                <div className="form-container">

                    <h2>Login</h2>

                    <form onSubmit={handleLogin}>

                        <input
                            type="email"
                            placeholder="Enter Email"
                            value={user.email}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    email: e.target.value
                                })
                            }
                            required
                        />

                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={user.password}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    password: e.target.value
                                })
                            }
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    <p>
                        Don't have an account?
                        <button onClick={() => setPage("register")}>
                            Register
                        </button>
                    </p>

                    <button onClick={() => setPage("home")}>
                        Back to Home
                    </button>

                </div>
            )}

            {/* DASHBOARD */}
            {page === "dashboard" && loggedIn && (
                <div className="dashboard">

                    {/* HEADER */}
                    <header>

                        <h1>SecureBank Dashboard</h1>

                        <div className="dashboard-nav">

                            <button onClick={() =>
                                scrollToSection("account-section")
                            }>
                                Account
                            </button>

                            <button onClick={() =>
                                scrollToSection("profile-section")
                            }>
                                My Profile
                            </button>

                            <button onClick={() =>
                                scrollToSection("transfer-section")
                            }>
                                Transfer
                            </button>

                            <button onClick={() =>
                                scrollToSection("deposit-section")
                            }>
                                Deposit
                            </button>

                            <button onClick={() =>
                                scrollToSection("withdraw-section")
                            }>
                                Withdraw
                            </button>

                            <button onClick={() =>
                                scrollToSection("transaction-section")
                            }>
                                Transactions
                            </button>

                            <button onClick={handleLogout}>
                                Logout
                            </button>

                        </div>

                    </header>

                    {/* ACCOUNT BALANCE */}
                    <div
                        className="balance-card"
                        id="account-section"
                    >

                        <h2>Account Balance</h2>

                        <h1>{formatMoney(account?.balance)}</h1>

                        <p>
                            Account Number: {account?.accountNumber}
                        </p>

                        <p>
                            Account Type: {account?.accountType}
                        </p>

                        <button onClick={handleRefreshBalance}>
                            Refresh Balance
                        </button>

                    </div>

                    {/* MY PROFILE */}
                    <div
                        className="transaction-section"
                        id="profile-section"
                    >

                        <h2>My Profile</h2>

                        <p>
                            <strong>Customer Name:</strong>{" "}
                            {currentUser?.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {currentUser?.email}
                        </p>

                        <p>
                            <strong>Account Number:</strong>{" "}
                            {account?.accountNumber}
                        </p>

                        <p>
                            <strong>Account Type:</strong>{" "}
                            {account?.accountType}
                        </p>

                        <p>
                            <strong>Available Balance:</strong>{" "}
                            {formatMoney(account?.balance)}
                        </p>

                    </div>

                    {/* MONEY TRANSFER */}
                    <div
                        className="form-container"
                        id="transfer-section"
                    >

                        <h2>Money Transfer</h2>

                        <form onSubmit={handleTransfer}>

                            <input
                                type="text"
                                placeholder="Receiver Account Number"
                                value={transfer.toAccount}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        toAccount: e.target.value
                                    })
                                }
                                required
                            />

                            <input
                                type="number"
                                placeholder="Enter Amount"
                                min="1"
                                value={transfer.amount}
                                onChange={(e) =>
                                    setTransfer({
                                        ...transfer,
                                        amount: e.target.value
                                    })
                                }
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Processing..." : "Transfer Money"}
                            </button>

                        </form>

                    </div>

                    {/* DEPOSIT MONEY */}
                    <div
                        className="form-container"
                        id="deposit-section"
                    >

                        <h2>Deposit Money</h2>

                        <form onSubmit={handleDeposit}>

                            <input
                                type="number"
                                placeholder="Enter Deposit Amount"
                                min="1"
                                value={depositAmount}
                                onChange={(e) =>
                                    setDepositAmount(e.target.value)
                                }
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Processing..." : "Deposit"}
                            </button>

                        </form>

                    </div>

                    {/* WITHDRAW MONEY */}
                    <div
                        className="form-container"
                        id="withdraw-section"
                    >

                        <h2>Withdraw Money</h2>

                        <form onSubmit={handleWithdraw}>

                            <input
                                type="number"
                                placeholder="Enter Withdrawal Amount"
                                min="1"
                                value={withdrawAmount}
                                onChange={(e) =>
                                    setWithdrawAmount(e.target.value)
                                }
                                required
                            />

                            <button type="submit" disabled={loading}>
                                {loading ? "Processing..." : "Withdraw"}
                            </button>

                        </form>

                    </div>

                    {/* TRANSACTION HISTORY */}
                    <div
                        className="transaction-section"
                        id="transaction-section"
                    >

                        <h2>Transaction History</h2>

                        <button onClick={handleDownloadStatement}>
                            Download Bank Statement (PDF)
                        </button>

                        {transactions.length === 0 ? (
                            <p>No transactions available.</p>
                        ) : (

                            <table>

                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Account</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {transactions.map((item, index) => {

                                        const type =
                                            item.transactionType === "Credit"
                                                ? "Deposit"
                                                : item.transactionType === "Withdrawal"
                                                ? "Withdrawal"
                                                : "Transfer";

                                        const accountNo =
                                            item.transactionType === "Credit"
                                                ? item.toAccount
                                                : item.transactionType === "Withdrawal"
                                                ? item.fromAccount
                                                : item.toAccount;

                                        const amount =
                                            item.transactionType === "Credit"
                                                ? `+${formatMoney(item.amount)}`
                                                : `-${formatMoney(item.amount)}`;

                                        return (
                                            <tr key={item._id || index}>

                                                <td>{type}</td>

                                                <td>{accountNo}</td>

                                                <td>{amount}</td>

                                                <td>
                                                    {new Date(item.date).toLocaleString("en-IN")}
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default App;
