const User = require('../models/user.model');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;

exports.register = async (userData, file) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'email', 'password', 'contact_no', 'address', 'role', 'age', 'gender'];
        const missingFields = requiredFields.filter(field => !userData[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate role-specific fields
        if (userData.role === 'donor') {
            if (!userData.blood_group) {
                throw new Error('Blood group is required for donors');
            }
        } else if (userData.role === 'blood_bank_staff') {
            if (!userData.bank_id) {
                throw new Error('Bank ID is required for blood bank staff');
            }
        }
        
        // Handle profile picture upload if present
        if (file) {
            const relativePath = path.relative('public', file.path);
            userData.profile_picture = '/' + relativePath.replace(/\\/g, '/');
        }
        
        // Create user in database
        const user = await User.create(userData);
        
        // Return user data without sensitive information
        return {
            id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_picture: user.profile_picture
        };
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Email already exists');
        }
        throw error;
    }
};

exports.login = async ({ email, password }) => {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }
    
    // Return user data without sensitive information
    return {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        bank_id: user.bank_id,
        user_id: user.user_id  // Explicitly include user_id
    };
};

exports.getProfile = async (userId) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new Error('User not found');
    }
    
    return {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        blood_group: user.blood_group,
        contact_no: user.contact_no,
        address: user.address,
        age: user.age,
        gender: user.gender,
        last_donation_date: user.last_donation_date,
        profile_picture: user.profile_picture,
        bank_name: user.bank_name
    };
};

exports.updateProfile = async (userId, updateData, file) => {
    try {
        // Handle profile picture update if present
        if (file) {
            // Delete old profile picture if exists
            const user = await User.findById(userId);
            if (user.profile_picture && user.profile_picture !== '/images/default-avatar.png') {
                const oldPicturePath = path.join('uploads', path.basename(user.profile_picture));
                try {
                    await fs.unlink(oldPicturePath);
                } catch (error) {
                    console.error('Error deleting old profile picture:', error);
                }
            }
            
            // Store the path relative to uploads directory
            updateData.profile_picture = `/uploads/${file.filename}`;
        }
        
        const updatedUser = await User.updateProfile(userId, updateData);
        
        if (!updatedUser) {
            throw new Error('User not found');
        }
        
        return {
            id: updatedUser.user_id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            blood_group: updatedUser.blood_group,
            contact_no: updatedUser.contact_no,
            address: updatedUser.address,
            age: updatedUser.age,
            gender: updatedUser.gender,
            last_donation_date: updatedUser.last_donation_date,
            profile_picture: updatedUser.profile_picture || '/images/default-avatar.png',
            bank_name: updatedUser.bank_name
        };
    } catch (error) {
        throw error;
    }
};

exports.logout = async (req, res) => {
    try {
        // Since we're using JWT, we don't need to do anything server-side
        // The client will remove the token from localStorage
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error during logout'
        });
    }
}; 