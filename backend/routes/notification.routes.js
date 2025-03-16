const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth, checkRole } = require('../middleware/auth');

// All routes are protected
router.use(auth);

// User routes
router.get('/', notificationController.getUserNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.put('/:notification_id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

// Admin routes
router.delete('/cleanup', checkRole(['admin']), notificationController.cleanupOldNotifications);

module.exports = router; 