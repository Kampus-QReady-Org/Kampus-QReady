// Author: Mudau Khuthadzo (51978156)

const jwt = require('jsonwebtoken');

// Middleware function to intercept requests and verify the provided JWT authorization token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expected format: "Bearer <token>"

    // Check if a token is present in the request header; if missing, deny access with a 401 status response
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Verify the token using the secret key and attach the decoded user data payload to the request object
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the decoded user payload to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If token verification fails due to expiration or invalid signature, return a 403 forbidden error response
        return res.status(403).json({ error: "Invalid or expired token." });
    }
}

// Export the authentication middleware function so it can protect secure routes
module.exports = authenticateToken;