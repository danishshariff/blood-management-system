const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    req.user = req.session.user;
    next();
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
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