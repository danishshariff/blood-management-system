const db = require('../utils/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { name, email, password, contact_no, address, blood_group, role, age, gender, bank_id = null, profile_picture = null } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users 
            (name, email, password, contact_no, address, blood_group, role, age, gender, bank_id, profile_picture)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING user_id, name, email, role`;
        
        const values = [name, email, hashedPassword, contact_no, address, blood_group, role, age, gender, bank_id, profile_picture];
        
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async findById(userId) {
        const query = `
            SELECT u.*, bb.name as bank_name 
            FROM users u 
            LEFT JOIN blood_banks bb ON u.bank_id = bb.bank_id 
            WHERE u.user_id = $1`;
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }

    static async updateProfile(userId, updateData) {
        const allowedUpdates = ['name', 'contact_no', 'address', 'profile_picture', 'age', 'gender', 'blood_group'];
        const updates = [];
        const values = [];
        let counter = 1;

        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key) && updateData[key] !== undefined) {
                updates.push(`${key} = $${counter}`);
                values.push(updateData[key]);
                counter++;
            }
        });

        if (updates.length === 0) return null;

        values.push(userId);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE user_id = $${counter} 
            RETURNING *`;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async updateLastDonation(userId) {
        console.log('Updating last donation date for user:', userId);
        const query = `
            UPDATE users 
            SET last_donation_date = CURRENT_DATE 
            WHERE user_id = $1 
            RETURNING last_donation_date`;
        const result = await db.query(query, [userId]);
        console.log('Last donation date updated to:', result.rows[0].last_donation_date);
        return result.rows[0];
    }

    static async getLastDonationDate(userId) {
        const query = `
            SELECT last_donation_date 
            FROM users 
            WHERE user_id = $1`;
        const result = await db.query(query, [userId]);
        return result.rows[0]?.last_donation_date;
    }

    static async getDonorsByBloodGroup(bloodGroup, bankId) {
        const query = `
            SELECT user_id, name, blood_group, contact_no, last_donation_date 
            FROM users 
            WHERE role = 'donor' 
            AND blood_group = $1 
            AND (last_donation_date IS NULL OR last_donation_date <= CURRENT_DATE - INTERVAL '90 days')
            AND (bank_id IS NULL OR bank_id = $2)`;
        const result = await db.query(query, [bloodGroup, bankId]);
        return result.rows;
    }

    static async validatePassword(providedPassword, storedPassword) {
        return await bcrypt.compare(providedPassword, storedPassword);
    }

    static async listAll() {
        const query = 'SELECT user_id, name, email, role FROM users';
        const result = await db.query(query);
        return result.rows;
    }

    static async findDonorsByBloodGroup(bloodGroup) {
        const query = `
            SELECT user_id, name, email 
            FROM users 
            WHERE role = 'donor' 
            AND blood_group = $1`;
        
        const result = await db.query(query, [bloodGroup]);
        return result.rows;
    }
}

module.exports = User; 