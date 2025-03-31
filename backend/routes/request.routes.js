const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { auth, checkRole } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/direct', requestController.createDirectRequest);

// Protected routes
router.use(auth);

// Unified request routes (for both bank and direct requests)
router.get('/:type/:requestId', checkRole(['donor', 'hospital_staff', 'blood_bank_staff']), requestController.getRequestDetails);
router.post('/:type/:requestId/donate', checkRole(['donor']), requestController.donateToRequest);

// Bank request routes
router.post('/bank', checkRole(['blood_bank_staff']), requestController.createRequest);
router.get('/bank/:bankId', checkRole(['blood_bank_staff']), requestController.getBankRequests);

// Available requests for donors
router.get('/available', checkRole(['donor']), requestController.getAvailableRequests);

module.exports = router;