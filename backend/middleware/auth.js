const auth = (req, res, next) => {
    if (!req.session.user) {
        // Check if it's an API request
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        return res.redirect('/login');
    }
    req.user = req.session.user;
    next();
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            // Check if it's an API request
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }
            return res.redirect('/login');
        }
        req.user = req.session.user;
        next();
    };
};

module.exports = {
    auth,
    checkRole
}; 