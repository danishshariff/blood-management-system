const db = require('../utils/db');

class DirectRequest {
    static async create({ requester_name, contact_no, blood_group, quantity, reason, bank_id, urgency }) {
        const query = `
            INSERT INTO direct_requests (
                requester_name, contact_no, blood_group,
                quantity, reason, bank_id, urgency, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
            RETURNING *`;

        const values = [
            requester_name,
            contact_no,
            blood_group,
            quantity,
            reason,
            bank_id,
            urgency || 'normal' // Default to normal if not provided
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findById(request_id) {
        const query = `
            SELECT dr.*, bb.name as bank_name, bb.address
            FROM direct_requests dr
            JOIN blood_banks bb ON dr.bank_id = bb.bank_id
            WHERE dr.request_id = $1
        `;

        const { rows } = await db.query(query, [request_id]);
        return rows[0];
    }

    static async findByBankId(bank_id) {
        const query = `
            SELECT *
            FROM direct_requests
            WHERE bank_id = $1
            ORDER BY created_at DESC
        `;

        const { rows } = await db.query(query, [bank_id]);
        return rows;
    }

    static async updateStatus(request_id, status, notes = null) {
        const query = `
            UPDATE direct_requests
            SET 
                status = $1,
                notes = $2,
                updated_at = NOW()
            WHERE request_id = $3
            RETURNING *
        `;

        const { rows } = await db.query(query, [status, notes, request_id]);
        return rows[0];
    }
}

module.exports = DirectRequest; 