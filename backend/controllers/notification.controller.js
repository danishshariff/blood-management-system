const Notification = require('../models/notification.model');

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getByUser(req.user.id);
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching notifications'
        });
    }
};

exports.getUnreadNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getUnreadByUser(req.user.id);
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching unread notifications'
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const notification = await Notification.markAsRead(notification_id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating notification'
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const notifications = await Notification.markAllAsRead(req.user.id);
        
        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating notifications'
        });
    }
};

// Cleanup old notifications (can be called via cron job)
exports.cleanupOldNotifications = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        await Notification.deleteOld(days);
        
        res.json({
            success: true,
            message: `Deleted notifications older than ${days} days`
        });
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cleaning up notifications'
        });
    }
}; 