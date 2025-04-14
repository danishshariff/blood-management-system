const Donation = require('../models/donation.model');
const BloodBank = require('../models/bloodBank.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

exports.createDonation = async (req, res) => {
    try {
        console.log('=== Starting Donation Process ===');
        console.log('User ID:', req.user.id);
        console.log('Donation Data:', {
            blood_group: req.body.blood_group,
            quantity: req.body.quantity,
            bank_id: req.body.bank_id
        });

        const donationData = {
            donor_id: req.user.id,
            blood_group: req.body.blood_group,
            quantity: req.body.quantity,
            bank_id: req.body.bank_id
        };

        const donation = await Donation.create(donationData);
        console.log('=== Donation Created Successfully ===');
        console.log('Donation Details:', donation);

        // Create notification for the donor
        await Notification.create({
            user_id: req.user.id,
            title: 'Donation Successful',
            message: `Thank you for donating ${donation.quantity} units of blood. Your contribution can save lives!`,
            type: 'donation'
        });

        // Update session with new last donation date
        req.session.user.last_donation_date = donation.last_donation_date;

        res.status(201).json({
            success: true,
            data: donation
        });
    } catch (error) {
        console.error('=== Donation Error ===');
        console.error('Error Details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing donation'
        });
    }
};

exports.getDonorHistory = async (req, res) => {
    try {
        const donations = await Donation.getDonationsByDonor(req.user.id);
        
        res.json({
            success: true,
            data: donations
        });
    } catch (error) {
        console.error('Error fetching donation history:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching donation history'
        });
    }
};

exports.getBankDonations = async (req, res) => {
    try {
        // Verify user is blood bank staff
        if (req.user.role !== 'blood_bank_staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only blood bank staff can view bank donations'
            });
        }

        const donations = await Donation.getDonationsByBank(req.user.bank_id);
        
        res.json({
            success: true,
            data: donations
        });
    } catch (error) {
        console.error('Error fetching bank donations:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching bank donations'
        });
    }
};

exports.getDonationStats = async (req, res) => {
    try {
        const stats = await Donation.getTotalDonations(req.user.id);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching donation statistics'
        });
    }
};

exports.checkEligibility = async (req, res) => {
    try {
        console.log('=== Checking Eligibility ===');
        const userId = req.user.id;
        console.log('User ID:', userId);
        
        const user = await User.findById(userId);
        const lastDonationDate = await User.getLastDonationDate(userId);
        console.log('User Data:', {
            id: user.user_id,
            last_donation_date: lastDonationDate,
            name: user.name
        });

        if (!lastDonationDate) {
            console.log('No previous donation found - User is eligible');
            return res.json({
                success: true,
                eligible: true,
                message: 'You are eligible to donate blood'
            });
        }

        const lastDonation = new Date(lastDonationDate);
        const today = new Date();
        const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
        
        console.log('Eligibility Calculation:', {
            last_donation_date: lastDonation,
            today: today,
            days_since_last_donation: daysSinceLastDonation,
            required_interval: 56
        });

        if (daysSinceLastDonation < 56) {
            const nextEligibleDate = new Date(lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000));
            console.log('User not eligible:', {
                days_remaining: 56 - daysSinceLastDonation,
                next_eligible_date: nextEligibleDate
            });
            
            return res.json({
                success: true,
                eligible: false,
                message: `You must wait ${56 - daysSinceLastDonation} more days before donating again`,
                nextEligibleDate: nextEligibleDate
            });
        }

        console.log('User is eligible to donate');
        res.json({
            success: true,
            eligible: true,
            message: 'You are eligible to donate blood'
        });
    } catch (error) {
        console.error('=== Eligibility Check Error ===');
        console.error('Error Details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error checking donation eligibility'
        });
    }
}; 