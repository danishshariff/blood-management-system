const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Database pool
const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'blood_bank_management',
    port: process.env.PG_PORT || 5432
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads'));

// Set default content type for API routes
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Session middleware
app.use(session({
    store: new pgSession({
        pool,
        tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Authentication middleware
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.redirect('/login');
        }
        next();
    };
};

// View Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        error: null,
        user: req.session.user || null
    });
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { 
        error: null,
        user: req.session.user || null
    });
});

app.get('/dashboard', authMiddleware, roleMiddleware(['donor']), (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

app.get('/bloodbank-dashboard', authMiddleware, roleMiddleware(['blood_bank_staff']), (req, res) => {
    res.render('bloodbank-dashboard', { user: req.session.user });
});

app.get('/donor-available-requests', authMiddleware, (req, res) => {
    res.render('donor-available-requests', { user: req.session.user });
});

app.get('/direct-request', (req, res) => {
    res.render('direct-request', { user: req.session.user || null });
});

app.get('/donation', authMiddleware, roleMiddleware(['donor']), (req, res) => {
    res.render('donation', { user: req.session.user });
});

app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const authController = require('./controllers/auth.controller');
        const user = await authController.getProfile(req.session.user.id);
        res.render('profile', { user });
    } catch (error) {
        res.render('error', { 
            message: error.message,
            user: req.session.user
        });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/donations', require('./routes/donation.routes'));
app.use('/api/requests', require('./routes/request.routes'));
app.use('/api/banks', require('./routes/bloodBank.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        user: req.session.user || null
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).render('404', { user: req.session.user || null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
