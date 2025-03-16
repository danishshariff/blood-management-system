const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { auth, checkRole } = require('../middleware/auth');

// Public routes for direct requests
router.post('/direct', requestController.createDirectRequest);
router.get('/direct/:request_id', requestController.getDirectRequest);

// Protected routes
router.use(auth);

// Blood bank staff routes
router.post('/create', checkRole(['blood_bank_staff']), requestController.createRequest);
router.get('/bank', checkRole(['blood_bank_staff']), requestController.getBankRequests);

// Donor routes
router.get('/available', checkRole(['donor']), requestController.getAvailableRequests);
router.post('/respond/:request_id', checkRole(['donor']), requestController.respondToRequest);

module.exports = router; 