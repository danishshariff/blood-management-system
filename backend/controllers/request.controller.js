const BloodRequest = require('../models/bloodRequest.model');
const DirectRequest = require('../models/directRequest.model');
const User = require('../models/user.model');

exports.createRequest = async (req, res) => {
    try {
        const { blood_group, quantity, urgency, reason } = req.body;
        
        // Get user data from session
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const bank_id = req.session.user.bank_id;
        const requester_id = req.session.user.user_id;

        console.log('Creating request with data:', {
            requester_id,
            bank_id,
            blood_group,
            quantity,
            urgency,
            reason
        });

        // Validate required fields
        if (!blood_group || !quantity || !urgency || !reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create blood request
        const request = await BloodRequest.create({
            requester_id,
            blood_group,
            quantity,
            urgency,
            reason,
            bank_id
        });

        console.log('Request created:', request);

        // Create notification for donors with matching blood group
        try {
            // Find donors with matching blood group
            const donors = await User.findDonorsByBloodGroup(blood_group);
            
            // Create notifications for each donor
            for (const donor of donors) {
                await Notification.create({
                    user_id: donor.user_id,
                    title: 'New Blood Request',
                    message: `Urgent blood request for ${quantity} units of ${blood_group} blood`,
                    type: 'request'
                });
            }
        } catch (notificationError) {
            console.error('Error creating notifications:', notificationError);
            // Don't fail the request if notifications fail
        }

        res.status(201).json({
            success: true,
            message: 'Blood request created successfully',
            data: request
        });
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
        const donor_id = req.user.id;
        const donor_blood_group = req.user.blood_group;
        
        // Get requests that match the donor's blood group
        const requests = await BloodRequest.findAvailableForDonor(donor_blood_group);

        res.json({
            success: true,
            data: requests
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
        const { requester_name, contact_no, blood_group, quantity, reason, bank_id, urgency } = req.body;

        // Validate required fields
        if (!requester_name || !contact_no || !blood_group || !quantity || !reason || !bank_id || !urgency) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate urgency value
        if (!['normal', 'urgent'].includes(urgency)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid urgency level'
            });
        }

        // Create direct request
        const request = await DirectRequest.create({
            requester_name,
            contact_no,
            blood_group,
            quantity,
            reason,
            bank_id,
            urgency
        });

        res.status(201).json({
            success: true,
            message: 'Direct request created successfully',
            data: request
        });
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
        const { request_id } = req.params;
        const request = await DirectRequest.findById(request_id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Direct request not found'
            });
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Error fetching direct request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching direct request'
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