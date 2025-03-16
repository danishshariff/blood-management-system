const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { auth, checkRole } = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Donor routes
router.post('/donate', donationController.createDonation);
router.get('/history', donationController.getDonorHistory);
router.get('/eligibility', donationController.checkEligibility);

// Blood bank staff routes
router.get('/bank', checkRole(['blood_bank_staff']), donationController.getBankDonations);
router.get('/stats', donationController.getDonationStats);

module.exports = router; 