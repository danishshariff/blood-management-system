const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { auth, checkRole } = require('../middleware/auth');

// Protected routes
router.use(auth);

// Donor routes
router.get('/available', checkRole(['donor']), requestController.getAvailableRequests);
router.get('/:type/:requestId', checkRole(['donor']), requestController.getRequestDetails);
router.post('/:type/:requestId/donate', checkRole(['donor']), requestController.donateToRequest);

// Blood bank staff routes
router.post('/create', checkRole(['blood_bank_staff']), requestController.createRequest);
router.get('/bank', checkRole(['blood_bank_staff']), requestController.getBankRequests);

// Direct request routes
router.post('/direct', requestController.createDirectRequest);

module.exports = router;