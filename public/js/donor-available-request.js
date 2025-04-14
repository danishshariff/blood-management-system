// Global variables for modals
let requestModalOverlay, donateModalOverlay, confirmedModalOverlay;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal variables
    requestModalOverlay = document.getElementById('requestModalOverlay');
    donateModalOverlay = document.getElementById('donateModalOverlay');
    confirmedModalOverlay = document.getElementById('confirmedModalOverlay');
    const requestTable = document.getElementById('requestTable');

    // Hide all modals initially
    requestModalOverlay.style.display = 'none';
    donateModalOverlay.style.display = 'none';
    confirmedModalOverlay.style.display = 'none';

    // Close modal buttons - using specific IDs
    document.getElementById('closeRequestModal').onclick = () => {
        requestModalOverlay.style.display = 'none';
    };
    document.getElementById('closeDonateModal').onclick = () => {
        donateModalOverlay.style.display = 'none';
    };
    document.getElementById('closeConfirmedModal').onclick = () => {
        confirmedModalOverlay.style.display = 'none';
    };

    // Cancel donation button
    document.getElementById('cancelDonationBtn').onclick = () => {
        donateModalOverlay.style.display = 'none';
    };

    // Load requests
    async function loadRequests() {
        try {
            const response = await fetch('/api/requests/available');
            if (!response.ok) {
                throw new Error('Failed to load requests');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to load requests');
            }

            displayRequests(data.data.requests || []);
        } catch (error) {
            console.error('Error loading requests:', error);
            requestTable.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Error loading requests: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    // Display requests in table
    function displayRequests(requests) {
        if (!requests || requests.length === 0) {
            requestTable.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center">
                        No donation requests available
                    </td>
                </tr>
            `;
            return;
        }

        requestTable.innerHTML = requests.map(request => `
            <tr>
                <td>${request.requester_name || '-'}</td>
                <td>${request.blood_group || '-'}</td>
                <td>${request.created_at ? new Date(request.created_at).toLocaleString() : '-'}</td>
                <td>${request.type === 'bank' ? 'Blood Bank' : (request.hospital_name || '-')}</td>
                <td>${request.address || '-'}</td>
                <td>${request.reason || '-'}</td>
                <td>
                    <span class="status-badge status-${request.status?.toLowerCase() || 'pending'}">
                        ${request.status || 'Pending'}
                    </span>
                </td>
                <td>${request.urgency === 'emergency' ? '<span class="emergency-badge">Emergency</span>' : '-'}</td>
                <td>
                    <button type="button" class="btn-view" onclick="viewRequest('${request.request_id}', '${request.type}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
                <td>
                    ${request.status === 'pending' ? `
                        <button type="button" class="btn-confirm" onclick="confirmDonation('${request.request_id}', '${request.type}')">
                            <i class="fas fa-check"></i> Donate
                        </button>
                    ` : '-'}
                </td>
                <td>-</td>
            </tr>
        `).join('');
    }

    // Load requests when page loads
    loadRequests();
});

// Show error in table
function showError(message) {
    const requestTable = document.getElementById('requestTable');
    requestTable.innerHTML = `
        <tr>
            <td colspan="11" class="text-center text-danger">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </td>
        </tr>
    `;
}

// View request details
async function viewRequest(requestId, type) {
    try {
        console.log('Viewing request:', { requestId, type });
        const response = await fetch(`/api/requests/${type}/${requestId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch request details');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message);
        }

        const request = result.data;
        console.log('Request details:', request);
        
        // Update modal content
        document.getElementById('modalRecipientName').textContent = request.requester_name;
        document.getElementById('modalRecipientBloodGroup').textContent = request.blood_group;
        document.getElementById('modalDateTime').textContent = new Date(request.created_at).toLocaleString();
        document.getElementById('modalHospitalName').textContent = request.requester_name;
        document.getElementById('modalAddress').textContent = request.address;
        document.getElementById('modalReason').textContent = request.reason;
        document.getElementById('modalStatus').textContent = request.status;
        document.getElementById('modalEmergency').textContent = request.urgency === 'emergency' ? 'Yes' : 'No';
        document.getElementById('modalQuantity').textContent = `${request.quantity} units`;

        // Show/hide donate button based on status
        const donateBtn = document.getElementById('donateBtn');
        if (request.status === 'pending') {
            donateBtn.style.display = 'block';
            donateBtn.onclick = () => {
                requestModalOverlay.style.display = 'none';
                confirmDonation(requestId, type);
            };
        } else {
            donateBtn.style.display = 'none';
        }

        // Show modal
        requestModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error viewing request:', error);
        alert('Error viewing request details. Please try again.');
    }
}

// Handle donation confirmation
window.confirmDonation = function(requestId, type) {
    if (!requestId || !type) return;
    
    // Show donation confirmation modal
    donateModalOverlay.style.display = 'flex';

    // Set up confirmation button
    document.getElementById('confirmDonationBtn').onclick = async () => {
        try {
            console.log('Confirming donation:', { requestId, type });
            const response = await fetch(`/api/requests/${type}/${requestId}/donate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to confirm donation');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to confirm donation');
            }

            // Hide donate modal and show confirmation
            donateModalOverlay.style.display = 'none';
            confirmedModalOverlay.style.display = 'flex';

            // Set up the Go to Dashboard button
            const dashboardBtn = document.querySelector('#confirmedModalOverlay .btn-confirm');
            if (dashboardBtn) {
                dashboardBtn.onclick = () => {
                    window.location.href = '/dashboard';
                };
            }
        } catch (error) {
            console.error('Error confirming donation:', error);
            donateModalOverlay.style.display = 'none';
            showError(error.message);
        }
    };
};