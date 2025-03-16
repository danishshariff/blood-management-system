const db = require('../utils/db');

class Notification {
    static async create(notificationData) {
        const { user_id, title, message, type } = notificationData;
        
        const query = `
            INSERT INTO notifications 
            (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        
        const result = await db.query(query, [user_id, title, message, type]);
        return result.rows[0];
    }

    static async getByUser(userId) {
        const query = `
            SELECT * 
            FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC`;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async getUnreadByUser(userId) {
        const query = `
            SELECT * 
            FROM notifications 
            WHERE user_id = $1 AND is_read = false 
            ORDER BY created_at DESC`;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async markAsRead(notificationId) {
        const query = `
            UPDATE notifications 
            SET is_read = true 
            WHERE notification_id = $1 
            RETURNING *`;
        const result = await db.query(query, [notificationId]);
        return result.rows[0];
    }

    static async markAllAsRead(userId) {
        const query = `
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = $1 AND is_read = false 
            RETURNING *`;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async deleteOld(days = 30) {
        const query = `
            DELETE FROM notifications 
            WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'`;
        await db.query(query);
    }
}

module.exports = Notification; 