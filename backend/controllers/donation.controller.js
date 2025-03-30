const Donation = require('../models/donation.model');
const BloodBank = require('../models/bloodBank.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

exports.createDonation = async (req, res) => {
    try {
        const donationData = {
            donor_id: req.user.id,
            blood_group: req.body.blood_group,
            quantity: req.body.quantity,
            bank_id: req.body.bank_id
        };

        const donation = await Donation.create(donationData);

        // Create notification for the donor
        await Notification.create({
            user_id: req.user.id,
            title: 'Donation Successful',
            message: `Thank you for donating ${donation.quantity} units of blood. Your contribution can save lives!`,
            type: 'donation'
        });

        res.status(201).json({
            success: true,
            data: donation
        });
    } catch (error) {
        console.error('Donation error:', error);
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
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.last_donation_date) {
            return res.json({
                success: true,
                eligible: true,
                message: 'You are eligible to donate blood'
            });
        }

        const lastDonation = new Date(user.last_donation_date);
        const today = new Date();
        const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));

        if (daysSinceLastDonation < 56) {
            return res.json({
                success: true,
                eligible: false,
                message: `You must wait ${56 - daysSinceLastDonation} more days before donating again`,
                nextEligibleDate: new Date(lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000))
            });
        }

        res.json({
            success: true,
            eligible: true,
            message: 'You are eligible to donate blood'
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error checking donation eligibility'
        });
    }
}; 