// Author: Mudau Khuthadzo (51978156)

const authService = require('../services/authService');

// Handle user registration requests by calling the auth service and returning a success response with the created user data
async function register(req, res) {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json({
            message: "User registered successfully",
            data: result
        });
    } catch (error) {
        // Catch any registration errors, log them to the console, and return an appropriate error status response
        console.error("Registration error:", error.message);
        res.status(500).json({ error: error.message || "Unable to complete registration." });
    }
}

// Handle user login requests by extracting credentials, authenticating via the auth service, and returning a success response
async function login(req, res) {
    try {
        const { username, password } = req.body;
        const result = await authService.authenticateUser(username, password);
        res.status(200).json({
            message: "Login successful",
            data: result
        });
    } catch (error) {
        // Catch authentication errors, log them to the console, and return an unauthorized error response
        console.error("Login error:", error.message);
        res.status(401).json({ error: error.message || "Authentication failed." });
    }
}

// Export the register and login controller functions for use in route configurations
module.exports = {
    register,
    login
};