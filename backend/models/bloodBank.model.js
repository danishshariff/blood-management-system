const db = require('../utils/db');

class BloodBank {
    static async create(bankData) {
        const { name, email, contact_no, address, state, city } = bankData;
        
        const query = `
            INSERT INTO blood_banks 
            (name, email, contact_no, address, state, city)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        
        const values = [name, email, contact_no, address, state, city];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findById(bankId) {
        const query = `
            SELECT bb.*, 
                   json_agg(json_build_object(
                       'blood_group', bs.blood_group,
                       'quantity_available', bs.quantity_available
                   )) as blood_stock
            FROM blood_banks bb
            LEFT JOIN blood_stock bs ON bb.bank_id = bs.bank_id
            WHERE bb.bank_id = $1
            GROUP BY bb.bank_id`;
        const result = await db.query(query, [bankId]);
        return result.rows[0];
    }

    static async findByLocation(state, city) {
        const query = `
            SELECT bb.*, 
                   json_agg(json_build_object(
                       'blood_group', bs.blood_group,
                       'quantity_available', bs.quantity_available
                   )) as blood_stock
            FROM blood_banks bb
            LEFT JOIN blood_stock bs ON bb.bank_id = bs.bank_id
            WHERE bb.state = $1 AND bb.city = $2
            GROUP BY bb.bank_id`;
        const result = await db.query(query, [state, city]);
        return result.rows;
    }

    static async updateStock(bankId, bloodGroup, quantity, operation = 'add') {
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            // Check if stock entry exists
            const checkQuery = `
                SELECT quantity_available 
                FROM blood_stock 
                WHERE bank_id = $1 AND blood_group = $2`;
            const checkResult = await client.query(checkQuery, [bankId, bloodGroup]);
            
            let result;
            if (checkResult.rows.length === 0) {
                // Create new stock entry
                const insertQuery = `
                    INSERT INTO blood_stock (bank_id, blood_group, quantity_available)
                    VALUES ($1, $2, $3)
                    RETURNING *`;
                result = await client.query(insertQuery, [bankId, bloodGroup, quantity]);
            } else {
                // Update existing stock
                const currentQuantity = checkResult.rows[0].quantity_available;
                const newQuantity = operation === 'add' 
                    ? currentQuantity + quantity
                    : currentQuantity - quantity;

                if (newQuantity < 0) {
                    throw new Error('Insufficient blood stock');
                }

                const updateQuery = `
                    UPDATE blood_stock 
                    SET quantity_available = $1, last_updated = CURRENT_TIMESTAMP
                    WHERE bank_id = $2 AND blood_group = $3
                    RETURNING *`;
                result = await client.query(updateQuery, [newQuantity, bankId, bloodGroup]);
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

    static async getBloodAvailability(bankId, bloodGroup) {
        const query = `
            SELECT quantity_available 
            FROM blood_stock 
            WHERE bank_id = $1 AND blood_group = $2`;
        const result = await db.query(query, [bankId, bloodGroup]);
        return result.rows[0]?.quantity_available || 0;
    }

    static async getAllBanks() {
        const query = `
            SELECT bank_id, name, city, state
            FROM blood_banks
            ORDER BY name`;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = BloodBank; 