document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const locationSearch = document.getElementById('locationSearch');
    const bloodGroupFilter = document.getElementById('bloodGroupFilter');
    const statusFilter = document.getElementById('statusFilter');
    const emergencyFilter = document.getElementById('emergencyFilter');
    const activeFilters = document.getElementById('activeFilters');
    const requestTable = document.getElementById('requestTable').getElementsByTagName('tbody')[0];
    const requestModal = document.getElementById('requestModalOverlay');
    const donateModal = document.getElementById('donateModalOverlay');
    const confirmedModal = document.getElementById('confirmedModalOverlay');
    const noResults = document.getElementById('noResults');
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    // Store all requests for client-side filtering
    let allRequests = [];
    let currentRequest = null;

    // Load and filter requests
    async function loadRequests() {
        try {
            // Show loading state
            requestTable.innerHTML = '<tr><td colspan="11" class="text-center">' + loadingSpinner.outerHTML + '</td></tr>';

            const response = await fetch(`${window.API_URL}/requests`);
            if (!response.ok) {
                throw new Error('Failed to load requests');
            }

            const { requests, user } = await response.json();
            allRequests = requests;
            
            // Apply filters
            filterRequests();
        } catch (error) {
            console.error('Error loading requests:', error);
            requestTable.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-error">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load requests. ${error.message}
                        <button onclick="loadRequests()" class="btn-retry">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    // Filter requests based on current filter values
    function filterRequests() {
        const searchTerm = locationSearch.value.toLowerCase();
        const bloodGroup = bloodGroupFilter.value;
        const status = statusFilter.value;
        const emergency = emergencyFilter.checked;

        // Update active filters display
        updateActiveFilters(searchTerm, bloodGroup, status, emergency);

        // Filter requests
        let filteredRequests = allRequests;

        if (searchTerm) {
            filteredRequests = filteredRequests.filter(request => 
                request.hospitalName.toLowerCase().includes(searchTerm) ||
                request.hospitalAddress.toLowerCase().includes(searchTerm) ||
                request.city?.toLowerCase().includes(searchTerm) ||
                request.state?.toLowerCase().includes(searchTerm)
            );
        }

        if (bloodGroup) {
            filteredRequests = filteredRequests.filter(request => 
                request.bloodGroup === bloodGroup
            );
        }

        if (status !== 'all') {
            filteredRequests = filteredRequests.filter(request => 
                request.status === status
            );
        }

        if (emergency) {
            filteredRequests = filteredRequests.filter(request => 
                request.isEmergency
            );
        }

        // Update table
        updateRequestsTable(filteredRequests);
    }

    // Update active filters display
    function updateActiveFilters(searchTerm, bloodGroup, status, emergency) {
        const filters = [];

        if (searchTerm) {
            filters.push(`
                <div class="filter-tag">
                    <span>Location: ${searchTerm}</span>
                    <i class="fas fa-times" onclick="clearFilter('location')"></i>
                </div>
            `);
        }

        if (bloodGroup) {
            filters.push(`
                <div class="filter-tag">
                    <span>Blood Group: ${bloodGroup}</span>
                    <i class="fas fa-times" onclick="clearFilter('bloodGroup')"></i>
                </div>
            `);
        }

        if (status !== 'all') {
            filters.push(`
                <div class="filter-tag">
                    <span>Status: ${status}</span>
                    <i class="fas fa-times" onclick="clearFilter('status')"></i>
                </div>
            `);
        }

        if (emergency) {
            filters.push(`
                <div class="filter-tag">
                    <span>Emergency Only</span>
                    <i class="fas fa-times" onclick="clearFilter('emergency')"></i>
                </div>
            `);
        }

        activeFilters.innerHTML = filters.join('');
        activeFilters.style.display = filters.length ? 'flex' : 'none';
    }

    // Clear individual filter
    window.clearFilter = function(filterType) {
        switch (filterType) {
            case 'location':
                locationSearch.value = '';
                break;
            case 'bloodGroup':
                bloodGroupFilter.value = '';
                break;
            case 'status':
                statusFilter.value = 'all';
                break;
            case 'emergency':
                emergencyFilter.checked = false;
                break;
        }
        filterRequests();
    };

    // Update requests table with filtered data
    function updateRequestsTable(requests) {
        requestTable.innerHTML = '';
        
        if (!requests || requests.length === 0) {
            noResults.style.display = 'block';
            requestTable.innerHTML = '<tr><td colspan="11" class="text-center">No requests found</td></tr>';
            return;
        }

        noResults.style.display = 'none';
        const isDonor = true; // This should come from user data

        requests.forEach(request => {
            const row = requestTable.insertRow();
            row.innerHTML = `
                <td>${request.patientName}</td>
                <td>${request.bloodGroup}</td>
                <td>${new Date(request.requiredDate).toLocaleString()}</td>
                <td>${request.hospitalName}</td>
                <td>${request.hospitalAddress}</td>
                <td>${request.purpose}</td>
                <td>
                    <span class="status-badge status-${request.status.toLowerCase()}">
                        ${request.status}
                    </span>
                </td>
                <td>
                    ${request.isEmergency ? 
                        '<span class="emergency-badge">Emergency</span>' : 
                        '-'}
                </td>
                <td>
                    <button class="btn-view" onclick="viewRequest('${request._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
                <td>
                    ${isDonor && request.status === 'pending' ? `
                        <button class="btn-confirm" onclick="confirmRequest('${request._id}')">
                            <i class="fas fa-check"></i> Donate
                        </button>
                    ` : ''}
                </td>
                <td>
                    ${(isDonor && request.donorId === user?._id) || (!isDonor && request.status === 'pending') ? `
                        <button class="btn-cancel" onclick="cancelRequest('${request._id}')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </td>
            `;
        });
    }

    // View request details
    window.viewRequest = async function(requestId) {
        try {
            const response = await fetch(`${window.API_URL}/requests/${requestId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch request details');
            }

            const { request, user } = await response.json();
            currentRequest = request;

            // Populate modal with request details
            document.getElementById('modalRecipientName').textContent = request.patientName;
            document.getElementById('modalRecipientBloodGroup').textContent = request.bloodGroup;
            document.getElementById('modalDateTime').textContent = new Date(request.requiredDate).toLocaleString();
            document.getElementById('modalAddress').textContent = request.hospitalAddress;
            document.getElementById('modalHospitalName').textContent = request.hospitalName;
            document.getElementById('modalReason').textContent = request.purpose;
            document.getElementById('modalStatus').textContent = request.status;
            document.getElementById('modalEmergency').textContent = request.isEmergency ? 'Yes' : 'No';

            // Update donate button visibility
            const donateBtn = document.getElementById('donateBtn');
            if (user.role === 'donor' && request.status === 'pending') {
                donateBtn.style.display = 'inline-block';
            } else {
                donateBtn.style.display = 'none';
            }

            // Show modal
            requestModal.style.display = 'flex';
        } catch (error) {
            console.error('Error viewing request:', error);
            showError('Failed to load request details');
        }
    };

    // Confirm donation
    window.confirmRequest = async function(requestId) {
        if (!currentRequest) {
            alert('Request details not found');
            return;
        }

        try {
            // Get user info from API
            const userResponse = await fetch(`${window.API_URL}/profile`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }
            const user = await userResponse.json();
            
            // Pre-fill donor information
            document.getElementById('donorNameInput').value = `${user.firstName} ${user.lastName}`;
            document.getElementById('donorEmailInput').value = user.email;
            
            // Show donate modal
            donateModal.style.display = 'flex';

            // Handle donation confirmation
            document.getElementById('confirmDonationBtn').onclick = async function() {
                const donorName = document.getElementById('donorNameInput').value;
                const donorEmail = document.getElementById('donorEmailInput').value;

                if (!donorName || !donorEmail) {
                    alert('Please fill in all fields');
                    return;
                }

                try {
                    const confirmBtn = document.getElementById('confirmDonationBtn');
                    confirmBtn.disabled = true;
                    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming...';

                    const response = await fetch(`${window.API_URL}/requests/${requestId}/donate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ donorName, donorEmail })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to confirm donation');
                    }

                    // Hide donate modal and show confirmed modal
                    donateModal.style.display = 'none';
                    confirmedModal.style.display = 'flex';

                    // Reload requests after confirmation
                    loadRequests();
                } catch (error) {
                    console.error('Error confirming donation:', error);
                    alert('Failed to confirm donation: ' + error.message);
                } finally {
                    const confirmBtn = document.getElementById('confirmDonationBtn');
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = 'Confirm Donation';
                }
            };
        } catch (error) {
            console.error('Error confirming request:', error);
            showError('Failed to confirm request');
        }
    };

    // Cancel request
    window.cancelRequest = async function(requestId) {
        if (!confirm('Are you sure you want to cancel this request?')) {
            return;
        }

        try {
            const response = await fetch(`${window.API_URL}/requests/${requestId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel request');
            }

            // Reload requests after cancellation
            loadRequests();
        } catch (error) {
            console.error('Error canceling request:', error);
            showError('Failed to cancel request');
        }
    };

    // Close modals
    document.getElementById('closeRequestModal').onclick = function() {
        requestModal.style.display = 'none';
        currentRequest = null;
    };

    document.getElementById('closeDonateModal').onclick = function() {
        donateModal.style.display = 'none';
    };

    document.getElementById('closeConfirmedModal').onclick = function() {
        confirmedModal.style.display = 'none';
        window.location.href = 'dashboard.html';
    };

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target === requestModal) {
            requestModal.style.display = 'none';
            currentRequest = null;
        }
        if (event.target === donateModal) {
            donateModal.style.display = 'none';
        }
        if (event.target === confirmedModal) {
            confirmedModal.style.display = 'none';
            window.location.href = 'dashboard.html';
        }
    };

    // Event Listeners
    locationSearch.addEventListener('input', debounce(filterRequests, 300));
    bloodGroupFilter.addEventListener('change', filterRequests);
    statusFilter.addEventListener('change', filterRequests);
    emergencyFilter.addEventListener('change', filterRequests);

    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initial load
    loadRequests();
});