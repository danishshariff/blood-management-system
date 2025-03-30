const db = require('../utils/db');
const BloodBank = require('./bloodBank.model');
const User = require('./user.model');

const MIN_DONATION_INTERVAL_DAYS = 56;

class Donation {
    static async create(donationData) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const { donor_id, blood_group, quantity, bank_id } = donationData;
            
            // Check last donation date
            const userQuery = 'SELECT last_donation_date FROM users WHERE user_id = $1';
            const userResult = await client.query(userQuery, [donor_id]);
            
            if (userResult.rows[0]?.last_donation_date) {
                const lastDonation = new Date(userResult.rows[0].last_donation_date);
                const today = new Date();
                const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
                    throw new Error(`Must wait ${MIN_DONATION_INTERVAL_DAYS - daysSinceLastDonation} more days before donating again`);
                }
            }
            
            // Create donation record
            const donationQuery = `
                INSERT INTO donations 
                (donor_id, blood_group, quantity, donation_date, bank_id)
                VALUES ($1, $2, $3, CURRENT_DATE, $4)
                RETURNING *`;
            
            const donationResult = await client.query(donationQuery, [
                donor_id, blood_group, quantity, bank_id
            ]);
            
            // Update blood bank stock
            await BloodBank.updateStock(bank_id, blood_group, quantity, 'add');
            
            // Update user's last donation date
            await User.updateLastDonation(donor_id);
            
            await client.query('COMMIT');
            return donationResult.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getDonationsByDonor(donorId) {
        const query = `
            SELECT d.*, bb.name as bank_name
            FROM donations d
            JOIN blood_banks bb ON d.bank_id = bb.bank_id
            WHERE d.donor_id = $1
            ORDER BY d.donation_date DESC`;
        const result = await db.query(query, [donorId]);
        return result.rows;
    }

    static async getDonationsByBank(bankId) {
        const query = `
            SELECT d.*, u.name as donor_name
            FROM donations d
            JOIN users u ON d.donor_id = u.user_id
            WHERE d.bank_id = $1
            ORDER BY d.donation_date DESC`;
        const result = await db.query(query, [bankId]);
        return result.rows;
    }

    static async getTotalDonations(donorId = null) {
        try {
            let stats = {};
            
            if (donorId) {
                // Get total donations count
                const totalQuery = `
                    SELECT COUNT(*) as total, SUM(quantity) as total_units
                    FROM donations 
                    WHERE donor_id = $1 AND status = 'completed'`;
                const totalResult = await db.query(totalQuery, [donorId]);
                stats.total = parseInt(totalResult.rows[0].total) || 0;
                stats.totalUnits = parseInt(totalResult.rows[0].total_units) || 0;
                
                // Get last donation date
                const lastDonationQuery = `
                    SELECT last_donation_date 
                    FROM users 
                    WHERE user_id = $1`;
                const lastDonationResult = await db.query(lastDonationQuery, [donorId]);
                stats.lastDonationDate = lastDonationResult.rows[0]?.last_donation_date || null;
                
                if (stats.lastDonationDate) {
                    const lastDonation = new Date(stats.lastDonationDate);
                    const today = new Date();
                    const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
                    
                    if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
                        stats.nextEligibleDate = new Date(lastDonation.getTime() + (MIN_DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000));
                    }
                }
            } else {
                // For blood bank dashboard
                const totalQuery = `
                    SELECT COUNT(*) as total, SUM(quantity) as total_units
                    FROM donations 
                    WHERE status = 'completed'`;
                const totalResult = await db.query(totalQuery);
                stats.total = parseInt(totalResult.rows[0].total) || 0;
                stats.totalUnits = parseInt(totalResult.rows[0].total_units) || 0;
                
                // Get today's donations
                const todayQuery = `
                    SELECT COUNT(*) as today_count
                    FROM donations 
                    WHERE DATE(donation_date) = CURRENT_DATE`;
                const todayResult = await db.query(todayQuery);
                stats.todayDonations = parseInt(todayResult.rows[0].today_count) || 0;
            }
            
            return stats;
        } catch (error) {
            console.error('Error getting donation stats:', error);
            throw error;
        }
    }
}

module.exports = Donation; 