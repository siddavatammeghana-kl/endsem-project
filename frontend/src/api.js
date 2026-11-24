
const API_URL = "http://localhost:5000/api";

// USER REGISTRATION
export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
};

// USER LOGIN
export const loginUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};

// GET USER BANK ACCOUNT
export const getAccount = async (token) => {
    const response = await fetch(`${API_URL}/account/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to fetch account");
    }

    return data;
};

// MONEY TRANSFER
export const transferMoney = async (transferData, token) => {
    const response = await fetch(`${API_URL}/transactions/transfer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(transferData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Transfer failed");
    }

    return data;
};
// 5. GET SAVED TRANSACTION HISTORY
export const getTransactions = async (token) => {
    const response = await fetch(`${API_URL}/transactions/history`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to fetch transactions");
    }

    return data.transactions;
};// 6. DEPOSIT MONEY
export const depositMoney = async (amount, token) => {
    const response = await fetch(`${API_URL}/transactions/deposit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Deposit failed");
    }

    return data;
};
// 7. WITHDRAW MONEY
export const withdrawMoney = async (amount, token) => {
    const response = await fetch(`${API_URL}/transactions/withdraw`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Withdrawal failed");
    }

    return data;
};
