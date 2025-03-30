const BloodBank = require('../models/bloodBank.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const db = require('../utils/db');
const { getClient } = require('../utils/db');

exports.createBank = async (req, res) => {
    try {
        const bankData = {
            name: req.body.name,
            email: req.body.email,
            contact_no: req.body.contact_no,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city
        };

        const bank = await BloodBank.create(bankData);

        res.status(201).json({
            success: true,
            message: 'Blood bank created successfully',
            data: bank
        });
    } catch (error) {
        console.error('Bank creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating blood bank'
        });
    }
};

exports.getBankDetails = async (req, res) => {
    try {
        const { bank_id } = req.params;
        const bank = await BloodBank.findById(bank_id);

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Blood bank not found'
            });
        }

        res.json({
            success: true,
            data: bank
        });
    } catch (error) {
        console.error('Error fetching bank details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching blood bank details'
        });
    }
};

exports.getBanksByLocation = async (req, res) => {
    try {
        const { state, city } = req.query;
        const banks = await BloodBank.findByLocation(state, city);

        res.json({
            success: true,
            data: banks
        });
    } catch (error) {
        console.error('Error fetching banks by location:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching blood banks'
        });
    }
};

exports.updateBloodStock = async (req, res) => {
    try {
        // Verify user is blood bank staff
        if (req.user.role !== 'blood_bank_staff') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only blood bank staff can update stock'
            });
        }

        const { blood_group, quantity, operation } = req.body;
        const bank_id = req.user.bank_id;

        const updatedStock = await BloodBank.updateStock(bank_id, blood_group, quantity, operation);

        // If stock is low after update, notify staff
        if (updatedStock.quantity_available < 10) {
            await Notification.create({
                user_id: req.user.id,
                title: 'Low Blood Stock Alert',
                message: `${blood_group} blood stock is running low (${updatedStock.quantity_available} units remaining).`,
                type: 'system'
            });
        }

        res.json({
            success: true,
            data: updatedStock
        });
    } catch (error) {
        console.error('Error updating blood stock:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating blood stock'
        });
    }
};

exports.getBloodAvailability = async (req, res) => {
    try {
        // Get bank_id from the logged-in user's session
        const bank_id = req.user.bank_id;
        
        if (!bank_id) {
            return res.status(400).json({
                success: false,
                message: 'No blood bank associated with this account'
            });
        }

        // Get all blood stock for the bank
        const query = `
            SELECT blood_group, quantity_available 
            FROM blood_stock 
            WHERE bank_id = $1`;
        const result = await db.query(query, [bank_id]);

        // Create a complete list of all blood groups with quantities
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        const stockData = bloodGroups.map(group => {
            const stock = result.rows.find(row => row.blood_group === group);
            return {
                blood_group: group,
                quantity_available: stock ? stock.quantity_available : 0
            };
        });

        res.json({
            success: true,
            data: stockData
        });
    } catch (error) {
        console.error('Error checking blood availability:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error checking blood availability'
        });
    }
};

exports.getAllBanks = async (req, res) => {
    try {
        const banks = await BloodBank.getAllBanks();

        res.json({
            success: true,
            data: banks
        });
    } catch (error) {
        console.error('Error fetching all banks:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching blood banks'
        });
    }
};

exports.createBloodBank = async (req, res) => {
    try {
        const { name, email, contact_no, address, state, city } = req.body;
        
        // Start transaction
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // Insert blood bank
            const bankResult = await client.query(
                'INSERT INTO blood_banks (name, email, contact_no, address, state, city) VALUES ($1, $2, $3, $4, $5, $6) RETURNING bank_id',
                [name, email, contact_no, address, state, city]
            );

            const bankId = bankResult.rows[0].bank_id;

            // Insert initial blood stock for all blood groups
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            for (const bloodGroup of bloodGroups) {
                await client.query(
                    'INSERT INTO blood_stock (bank_id, blood_group, quantity_available) VALUES ($1, $2, 0)',
                    [bankId, bloodGroup]
                );
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Blood bank created successfully',
                data: {
                    bank_id: bankId,
                    name,
                    email,
                    contact_no,
                    address,
                    state,
                    city
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating blood bank:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create blood bank'
        });
    }
}; 