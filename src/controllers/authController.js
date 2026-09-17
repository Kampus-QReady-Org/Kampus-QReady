const authService = require('../services/authService');

async function register(req, res) {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            message: "User registered successfully",
            data: result
        });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(500).json({ error: error.message || "Unable to complete registration." });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;
        const result = await authService.authenticateUser(username, password);
        res.status(200).json({
            message: "Login successful",
            data: result
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(401).json({ error: error.message || "Authentication failed." });
    }
}

module.exports = {
    register,
    login
};