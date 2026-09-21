// Author: Jacques McDermid Heyns (12692131)

/*
 * Middleware used to restrict routes to staff members only.
 *
 * authenticateToken should run before this middleware and
 * place the decoded JWT payload inside req.user.
 */
function authorizeStaff(req, res, next) {
    // This is just a defensive check.
    // Normally authenticateToken will already have rejected
    // unauthenticated requests before they reach this point.
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required.'
        });
    }

    // Only users whose JWT explicitly identifies them as
    // staff may continue to staff-management endpoints.
    if (req.user.isStaff !== true) {
        return res.status(403).json({
            error: 'Staff access required.'
        });
    }

    // The user is authenticated and authorized as staff.
    next();
}

module.exports = authorizeStaff;