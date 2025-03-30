const db = require('../utils/db');
const BloodBank = require('./bloodBank.model');

class BloodRequest {
    static async create({ requester_id, blood_group, quantity, urgency, reason, bank_id }) {
        const query = `
            INSERT INTO blood_requests (
                requester_id, blood_group, quantity, 
                urgency, reason, bank_id, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
            RETURNING *`;

        const values = [
            requester_id,
            blood_group,
            quantity,
            urgency,
            reason,
            bank_id
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByBankId(bank_id) {
        const query = `
            SELECT br.*, u.name as requester_name 
            FROM blood_requests br
            LEFT JOIN users u ON br.requester_id = u.id
            WHERE br.bank_id = $1
            ORDER BY br.created_at DESC
        `;

        const { rows } = await db.query(query, [bank_id]);
        return rows;
    }

    static async findAvailableForDonor(donor_blood_group) {
        // Get compatible blood groups based on donor's blood group
        const compatibleGroups = this.getCompatibleBloodGroups(donor_blood_group);
        
        const query = `
            SELECT br.*, bb.name as bank_name, bb.address
            FROM blood_requests br
            JOIN blood_banks bb ON br.bank_id = bb.bank_id
            WHERE br.blood_group = ANY($1)
            AND br.status = 'pending'
            ORDER BY 
                CASE br.urgency
                    WHEN 'emergency' THEN 1
                    WHEN 'urgent' THEN 2
                    ELSE 3
                END,
                br.created_at DESC
        `;

        const { rows } = await db.query(query, [compatibleGroups]);
        return rows;
    }

    static async respondToDonation(request_id, donor_id) {
        // Start a transaction
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');

            // Update request status
            const updateQuery = `
                UPDATE blood_requests 
                SET status = 'fulfilled', 
                    fulfilled_by = $1,
                    fulfilled_at = NOW()
                WHERE request_id = $2
                AND status = 'pending'
                RETURNING *
            `;

            const { rows: [request] } = await client.query(updateQuery, [donor_id, request_id]);

            if (!request) {
                throw new Error('Request not found or already fulfilled');
            }

            // Create donation record
            const donationQuery = `
                INSERT INTO donations (
                    donor_id, bank_id, blood_group, 
                    quantity, request_id, status, 
                    donation_date
                ) VALUES (
                    $1, $2, $3, $4, $5, 'completed', NOW()
                ) RETURNING *
            `;

            const donationValues = [
                donor_id,
                request.bank_id,
                request.blood_group,
                request.quantity,
                request_id
            ];

            const { rows: [donation] } = await client.query(donationQuery, donationValues);

            // Update or create blood stock
            const stockQuery = `
                INSERT INTO blood_stock (bank_id, blood_group, quantity_available)
                VALUES ($1, $2, $3)
                ON CONFLICT (bank_id, blood_group) 
                DO UPDATE SET 
                    quantity_available = blood_stock.quantity_available + $3,
                    last_updated = CURRENT_TIMESTAMP
                RETURNING *
            `;

            const { rows: [stock] } = await client.query(stockQuery, [
                request.bank_id,
                request.blood_group,
                request.quantity
            ]);

            await client.query('COMMIT');
            return { request, donation, stock };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static getCompatibleBloodGroups(donorBloodGroup) {
        const compatibility = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        };

        return compatibility[donorBloodGroup] || [];
    }

    static async createDirect(requestData) {
        const { requester_name, contact_no, blood_group, quantity, reason, bank_id } = requestData;
        
        const query = `
            INSERT INTO direct_requests 
            (requester_name, contact_no, blood_group, quantity, reason, bank_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        
        const result = await db.query(query, [
            requester_name, contact_no, blood_group, quantity, reason, bank_id
        ]);
        return result.rows[0];
    }

    static async getRequestsByBank(bankId, includeDirectRequests = true) {
        const requests = [];
        
        // Get regular requests
        const regularQuery = `
            SELECT br.*, u.name as requester_name, u.contact_no
            FROM blood_requests br
            JOIN users u ON br.requester_id = u.user_id
            WHERE br.bank_id = $1
            ORDER BY br.created_at DESC`;
        const regularResults = await db.query(regularQuery, [bankId]);
        requests.push(...regularResults.rows);
        
        if (includeDirectRequests) {
            // Get direct requests
            const directQuery = `
                SELECT *, 'direct' as request_type
                FROM direct_requests
                WHERE bank_id = $1
                ORDER BY created_at DESC`;
            const directResults = await db.query(directQuery, [bankId]);
            requests.push(...directResults.rows);
        }
        
        return requests;
    }

    static async getRequestsByUser(userId) {
        const query = `
            SELECT br.*, bb.name as bank_name
            FROM blood_requests br
            JOIN blood_banks bb ON br.bank_id = bb.bank_id
            WHERE br.requester_id = $1
            ORDER BY br.created_at DESC`;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async updateStatus(requestId, status, isDirectRequest = false) {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            const table = isDirectRequest ? 'direct_requests' : 'blood_requests';
            const query = `
                UPDATE ${table}
                SET status = $1
                WHERE request_id = $2
                RETURNING *`;
            
            const result = await client.query(query, [status, requestId]);
            
            if (result.rows.length === 0) {
                throw new Error('Request not found');
            }
            
            const request = result.rows[0];
            
            // If fulfilling request, update blood stock
            if (status === 'fulfilled') {
                await BloodBank.updateStock(
                    request.bank_id,
                    request.blood_group,
                    request.quantity,
                    'subtract'
                );
            }
            
            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getPendingRequests(bankId = null) {
        const query = bankId
            ? `SELECT * FROM blood_requests WHERE status = 'pending' AND bank_id = $1`
            : `SELECT * FROM blood_requests WHERE status = 'pending'`;
        
        const result = await db.query(query, bankId ? [bankId] : []);
        return result.rows;
    }
}

module.exports = BloodRequest; 