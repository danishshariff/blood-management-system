const express = require('express');
const router = express.Router();
const bloodBankController = require('../controllers/bloodBank.controller');
const { auth, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', bloodBankController.getAllBanks);
router.get('/location', bloodBankController.getBanksByLocation);

// Protected routes
router.use(auth);

// Blood bank staff routes
router.get('/stock', checkRole(['blood_bank_staff']), bloodBankController.getBloodAvailability);
router.put('/stock', checkRole(['blood_bank_staff']), bloodBankController.updateBloodStock);

router.get('/:bank_id', bloodBankController.getBankDetails);

// Admin routes
router.post('/', checkRole(['admin']), bloodBankController.createBank);

module.exports = router; 