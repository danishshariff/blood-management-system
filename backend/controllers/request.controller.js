const BloodRequest = require('../models/bloodRequest.model');
const DirectRequest = require('../models/directRequest.model');
const User = require('../models/user.model');
const { query, getClient } = require('../utils/db');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { checkRole } = require('../middleware/auth');
const { Donation } = require('../models/donation.model');

exports.createRequest = async (req, res) => {
    try {
        const { blood_group, quantity, urgency, reason } = req.body;
        console.log('Received request data:', { blood_group, quantity, urgency, reason });
        
        // Get user data from session
        if (!req.session.user) {
            console.log('No user in session');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const bank_id = req.session.user.bank_id;
        const requester_id = req.session.user.user_id;

        console.log('User data:', {
            bank_id,
            requester_id,
            user: req.session.user
        });

        // Validate required fields
        if (!blood_group || !quantity || !urgency || !reason) {
            console.log('Missing required fields:', { blood_group, quantity, urgency, reason });
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Start a transaction
        const client = await getClient();
        console.log('Got database client');
        
        try {
            await client.query('BEGIN');
            console.log('Started transaction');

            // Check blood stock availability
            const stockResult = await client.query(
                'SELECT quantity_available FROM blood_stock WHERE bank_id = $1 AND blood_group = $2',
                [bank_id, blood_group]
            );
            console.log('Stock check result:', stockResult.rows);

            let stockAvailable = 0;
            if (stockResult.rows.length > 0) {
                stockAvailable = stockResult.rows[0].quantity_available;
            }

            // Create blood request
            console.log('Creating blood request with data:', {
                requester_id,
                blood_group,
                quantity,
                urgency,
                reason,
                bank_id
            });

            const result = await client.query(
                `INSERT INTO blood_requests 
                (requester_id, blood_group, quantity, urgency, reason, bank_id, status) 
                VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
                RETURNING *`,
                [requester_id, blood_group, quantity, urgency, reason, bank_id]
            );
            console.log('Blood request created:', result.rows[0]);

            await client.query('COMMIT');
            console.log('Transaction committed successfully');

            res.status(201).json({
                success: true,
                message: 'Blood request created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error in transaction:', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
            console.log('Database client released');
        }
    } catch (error) {
        console.error('Error creating blood request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating blood request'
        });
    }
};

exports.getBankRequests = async (req, res) => {
    try {
        const bank_id = req.user.bank_id;
        const requests = await BloodRequest.findByBankId(bank_id);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching bank requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching blood requests'
        });
    }
};

exports.getAvailableRequests = async (req, res) => {
    try {
        console.log('User data:', req.session.user);
        console.log('Session data:', req.session);

        // Get donor's blood group
        const donorResult = await query(
            'SELECT blood_group FROM users WHERE user_id = $1',
            [req.session.user.user_id]
        );
        console.log('Donor query result:', donorResult.rows);

        if (!donorResult.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        const donorBloodGroup = donorResult.rows[0].blood_group;
        console.log('Donor blood group:', donorBloodGroup);

        // Check donor eligibility
        const lastDonation = await query(
            'SELECT donation_date FROM donations WHERE donor_id = $1 ORDER BY donation_date DESC LIMIT 1',
            [req.session.user.user_id]
        );
        console.log('Last donation:', lastDonation.rows);

        let isEligible = true;
        let nextEligibleDate = null;

        if (lastDonation.rows.length > 0) {
            const daysSinceLastDonation = Math.floor(
                (new Date() - new Date(lastDonation.rows[0].donation_date)) / (1000 * 60 * 60 * 24)
            );
            isEligible = daysSinceLastDonation >= 56;
            if (!isEligible) {
                const lastDonationDate = new Date(lastDonation.rows[0].donation_date);
                nextEligibleDate = new Date(lastDonationDate.setDate(lastDonationDate.getDate() + 56));
            }
        }
        console.log('Eligibility:', { isEligible, nextEligibleDate });

        // Get bank requests matching donor's blood group
        const bankRequests = await query(
            `SELECT 
                br.request_id,
                br.blood_group,
                br.quantity,
                br.urgency,
                br.reason,
                br.status,
                br.created_at,
                bb.name as bank_name,
                bb.address as bank_address,
                'bank' as type
            FROM blood_requests br
            JOIN blood_banks bb ON br.bank_id = bb.bank_id
            WHERE br.blood_group = $1 
            AND br.status = 'pending'`,
            [donorBloodGroup]
        );
        console.log('Bank requests query:', bankRequests.rows);

        // Get direct requests matching donor's blood group
        const directRequests = await query(
            `SELECT 
                dr.request_id,
                dr.blood_group,
                dr.quantity,
                dr.reason,
                dr.status,
                dr.created_at,
                dr.requester_name,
                dr.contact_no as hospital_address,
                'direct' as type
            FROM direct_requests dr
            WHERE dr.blood_group = $1 
            AND dr.status = 'pending'`,
            [donorBloodGroup]
        );
        console.log('Direct requests query:', directRequests.rows);

        // Check all pending requests regardless of blood group for debugging
        const allPendingRequests = await query(
            `SELECT 'bank' as type, blood_group, status FROM blood_requests WHERE status = 'pending'
            UNION ALL
            SELECT 'direct' as type, blood_group, status FROM direct_requests WHERE status = 'pending'`
        );
        console.log('All pending requests:', allPendingRequests.rows);

        // Combine and format requests
        const requests = [
            ...bankRequests.rows.map(req => ({
                request_id: req.request_id,
                type: 'bank',
                requester_name: req.bank_name,
                blood_group: req.blood_group,
                created_at: req.created_at,
                address: req.bank_address,
                reason: req.reason,
                status: req.status,
                urgency: req.urgency,
                quantity: req.quantity
            })),
            ...directRequests.rows.map(req => ({
                request_id: req.request_id,
                type: 'direct',
                requester_name: req.requester_name,
                blood_group: req.blood_group,
                created_at: req.created_at,
                address: req.hospital_address,
                reason: req.reason,
                status: req.status,
                quantity: req.quantity
            }))
        ];

        console.log('Final combined requests:', requests);

        res.json({
            success: true,
            data: {
                requests,
                isEligible,
                nextEligibleDate
            }
        });
    } catch (error) {
        console.error('Error fetching available requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching available requests'
        });
    }
};

exports.respondToRequest = async (req, res) => {
    try {
        const { request_id } = req.params;
        const donor_id = req.user.id;

        // Update request status and create donation record
        const result = await BloodRequest.respondToDonation(request_id, donor_id);

        res.json({
            success: true,
            message: 'Successfully responded to blood request',
            data: result
        });
    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error responding to request'
        });
    }
};

exports.createDirectRequest = async (req, res) => {
    try {
        const { requester_name, contact_no, blood_group, quantity, reason, bank_id } = req.body;
        console.log('Creating direct request:', { requester_name, contact_no, blood_group, quantity, reason, bank_id });

        // Validate required fields
        if (!requester_name || !contact_no || !blood_group || !quantity || !reason || !bank_id) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Start a transaction
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // Check blood stock availability
            const stockResult = await client.query(
                'SELECT quantity_available FROM blood_stock WHERE bank_id = $1 AND blood_group = $2',
                [bank_id, blood_group]
            );

            let stockAvailable = 0;
            if (stockResult.rows.length > 0) {
                stockAvailable = stockResult.rows[0].quantity_available;
            }

            // If stock is available and sufficient
            if (stockAvailable >= quantity) {
                // Update blood stock
                await client.query(
                    'UPDATE blood_stock SET quantity_available = quantity_available - $1 WHERE bank_id = $2 AND blood_group = $3',
                    [quantity, bank_id, blood_group]
                );

                // Create completed direct request
                const result = await client.query(
                    `INSERT INTO direct_requests 
                    (requester_name, blood_group, quantity, reason, status, bank_id, contact_no) 
                    VALUES ($1, $2, $3, $4, 'fulfilled', $5, $6) 
                    RETURNING *`,
                    [requester_name, blood_group, quantity, reason, bank_id, contact_no]
                );

                await client.query('COMMIT');

                return res.status(201).json({
                    success: true,
                    message: 'Request completed successfully. Blood stock has been updated.',
                    data: result.rows[0]
                });
            }

            // If stock is insufficient, create pending request
            const result = await client.query(
                `INSERT INTO direct_requests 
                (requester_name, blood_group, quantity, reason, status, bank_id, contact_no) 
                VALUES ($1, $2, $3, $4, 'pending', $5, $6) 
                RETURNING *`,
                [requester_name, blood_group, quantity, reason, bank_id, contact_no]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Request created successfully and is pending donor response.',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating direct request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating direct request'
        });
    }
};

exports.getDirectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        console.log('Getting direct request details for:', requestId);
        
        const request = await query(
            `SELECT dr.*, bb.name as bank_name, bb.address as bank_address
            FROM direct_requests dr
            JOIN blood_banks bb ON dr.bank_id = bb.bank_id
            WHERE dr.request_id::text = $1`,
            [requestId]
        );

        if (!request.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            request: request.rows[0]
        });
    } catch (error) {
        console.error('Error fetching direct request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching request details'
        });
    }
};

exports.getBankRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        console.log('Getting bank request details for:', requestId);
        
        const request = await query(
            `SELECT br.*, bb.name as bank_name, bb.address as bank_address
            FROM blood_requests br
            JOIN blood_banks bb ON br.bank_id = bb.bank_id
            WHERE br.request_id::text = $1`,
            [requestId]
        );

        if (!request.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            request: request.rows[0]
        });
    } catch (error) {
        console.error('Error fetching bank request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching request details'
        });
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.getRequestsByUser(req.user.id);
        
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching blood requests'
        });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { request_id } = req.params;
        const { status } = req.body;
        const isDirectRequest = req.query.type === 'direct';

        const request = await BloodRequest.updateStatus(request_id, status, isDirectRequest);

        // Create notification based on status update
        if (request.requester_id) {
            await Notification.create({
                user_id: request.requester_id,
                title: 'Blood Request Update',
                message: `Your blood request has been ${status}.`,
                type: 'request'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating request status'
        });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const bankId = req.query.bank_id;
        const requests = await BloodRequest.getPendingRequests(bankId);
        
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching pending requests'
        });
    }
};

exports.donateToRequest = async (req, res) => {
    try {
        const { type, requestId } = req.params;
        console.log('Processing donation:', { type, requestId, userId: req.user.user_id });
        
        // Check eligibility
        const lastDonation = await query(
            'SELECT donation_date FROM donations WHERE donor_id = $1 ORDER BY donation_date DESC LIMIT 1',
            [req.user.user_id]
        );

        if (lastDonation.rows.length > 0) {
            const daysSinceLastDonation = Math.floor(
                (new Date() - new Date(lastDonation.rows[0].donation_date)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastDonation < 56) {
                return res.status(400).json({
                    success: false,
                    message: `You must wait ${56 - daysSinceLastDonation} more days before donating again`
                });
            }
        }

        // Get request details
        let request;
        if (type === 'bank') {
            request = await query(
                `SELECT br.*, bb.bank_id 
                FROM blood_requests br
                JOIN blood_banks bb ON br.bank_id = bb.bank_id
                WHERE br.request_id = $1`,
                [requestId]
            );
        } else {
            request = await query(
                `SELECT dr.*, bb.bank_id 
                FROM direct_requests dr
                JOIN blood_banks bb ON dr.bank_id = bb.bank_id
                WHERE dr.request_id = $1`,
                [requestId]
            );
        }

        if (!request.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Start transaction
        const client = await getClient();
        try {
            await client.query('BEGIN');

            // Insert donation record
            const donationResult = await client.query(
                'INSERT INTO donations (donor_id, blood_group, donation_date, quantity, bank_id) VALUES ($1, $2, NOW(), $3, $4) RETURNING donation_id',
                [req.user.user_id, request.rows[0].blood_group, request.rows[0].quantity || 1, request.rows[0].bank_id]
            );

            if (type === 'bank') {
                // Check if blood stock exists for this blood group
                const stockCheck = await client.query(
                    'SELECT * FROM blood_stock WHERE bank_id = $1 AND blood_group = $2',
                    [request.rows[0].bank_id, request.rows[0].blood_group]
                );

                if (stockCheck.rows.length === 0) {
                    // Insert new stock row if it doesn't exist
                    await client.query(
                        'INSERT INTO blood_stock (bank_id, blood_group, quantity_available) VALUES ($1, $2, $3)',
                        [request.rows[0].bank_id, request.rows[0].blood_group, request.rows[0].quantity || 1]
                    );
                } else {
                    // Update existing stock
                    await client.query(
                        'UPDATE blood_stock SET quantity_available = quantity_available + $1 WHERE blood_group = $2 AND bank_id = $3',
                        [request.rows[0].quantity || 1, request.rows[0].blood_group, request.rows[0].bank_id]
                    );
                }
            }

            // Update request status
            const updateQuery = type === 'bank' 
                ? 'UPDATE blood_requests SET status = $1 WHERE request_id = $2'
                : 'UPDATE direct_requests SET status = $1 WHERE request_id = $2';
            
            await client.query(updateQuery, ['fulfilled', requestId]);

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Donation completed successfully'
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', error);
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process donation'
        });
    }
};

// Get bank or direct request details
exports.getRequestDetails = async (req, res) => {
    try {
        const { requestId, type } = req.params;
        console.log('Getting request details:', { requestId, type });

        let request;
        if (type === 'bank') {
            request = await query(
                `SELECT 
                    br.*,
                    bb.name as bank_name,
                    bb.address as bank_address
                FROM blood_requests br
                JOIN blood_banks bb ON br.bank_id = bb.bank_id
                WHERE br.request_id::text = $1`,
                [requestId]
            );
        } else {
            request = await query(
                `SELECT 
                    dr.*,
                    bb.name as bank_name,
                    bb.address as bank_address
                FROM direct_requests dr
                JOIN blood_banks bb ON dr.bank_id = bb.bank_id
                WHERE dr.request_id::text = $1`,
                [requestId]
            );
        }

        if (!request.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const requestData = request.rows[0];
        const response = {
            success: true,
            data: {
                request_id: requestData.request_id,
                type: type,
                requester_name: type === 'bank' ? requestData.bank_name : requestData.requester_name,
                blood_group: requestData.blood_group,
                quantity: requestData.quantity,
                reason: requestData.reason,
                status: requestData.status,
                created_at: requestData.created_at,
                address: type === 'bank' ? requestData.bank_address : requestData.hospital_address,
                urgency: requestData.urgency
            }
        };

        console.log('Request details response:', response);
        res.json(response);
    } catch (error) {
        console.error('Error getting request details:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting request details'
        });
    }
};