const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    req.user = req.session.user;
    next();
};

const apiAuthMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
    next();
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            if (req.path.startsWith('/api/')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
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
    apiAuthMiddleware,
    checkRole
}; 