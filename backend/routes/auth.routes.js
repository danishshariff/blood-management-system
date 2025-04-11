const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/user.model');

// Temporary route for debugging
router.get('/list-users', async (req, res) => {
    try {
        const users = await User.listAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public routes
router.post('/register', upload.single('profile_picture'), async (req, res) => {
    try {
        const user = await authController.register(req.body, req.file);
        
        // Always send JSON response for API requests
        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await authController.login({ email, password });
        req.session.user = user;
        
        // Send success response with redirect URL
        let redirectUrl = '/';
        if (user.role === 'donor') {
            redirectUrl = '/dashboard';
        } else if (user.role === 'blood_bank_staff') {
            redirectUrl = '/bloodbank-dashboard';
        }
        
        res.json({ 
            success: true,
            redirectUrl: redirectUrl
        });
    } catch (error) {
        res.status(401).json({ 
            success: false,
            message: error.message || 'Invalid email or password'
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Protected routes
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await authController.getProfile(req.session.user.id);
        res.render('profile', { user });
    } catch (error) {
        res.render('error', { 
            message: error.message,
            user: req.session.user
        });
    }
});

router.post('/profile', auth, upload.single('profile_picture'), async (req, res) => {
    try {
        const updatedUser = await authController.updateProfile(req.session.user.id, req.body, req.file);
        req.session.user = updatedUser;
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
});

module.exports = router; 