// Constants
const MIN_DONATION_INTERVAL_DAYS = 56;
const MIN_DONATION_QUANTITY = 350;
const MAX_DONATION_QUANTITY = 500;

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// API call helper with auth
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = await fetch(`${window.API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }

    return response;
}

// Load user data and initialize page
async function initializePage() {
    try {
        showLoading(true);
        const response = await apiCall('/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        
        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            if (userData.role === 'donor') {
                pageTitle.innerHTML = `Log Donation <span class="user-name">${userData.name}</span>`;
            } else if (userData.role === 'bloodbank') {
                pageTitle.innerHTML = `Record Donation <span class="user-name">${userData.name}</span>`;
            }
        }

        // Update form sections
        const donorSection = document.getElementById('donorSection');
        const bankSection = document.getElementById('bankSection');
        
        if (userData.role === 'donor') {
            donorSection.style.display = 'block';
            bankSection.style.display = 'none';
            
            // Check if donor is eligible to donate
            const lastDonation = userData.lastDonation ? new Date(userData.lastDonation) : null;
            if (lastDonation) {
                const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
                if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
                    showError(`You must wait ${MIN_DONATION_INTERVAL_DAYS - daysSinceLastDonation} more days before donating again`);
                    document.getElementById('donorDonationForm').style.display = 'none';
                    return;
                }
            }
            
            // Auto-populate donor fields
            document.getElementById('donorName').value = userData.name || '';
            document.getElementById('donorId').value = userData.id || '';
            document.getElementById('donorBloodGroup').value = userData.bloodGroup || '';
            
            // Load blood banks for dropdown
            await loadBloodBanks();
        } else {
            donorSection.style.display = 'none';
            bankSection.style.display = 'block';
            
            // Add donor lookup functionality
            setupDonorLookup();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Failed to load user data');
    } finally {
        showLoading(false);
    }
}

// Setup donor lookup for bank staff
function setupDonorLookup() {
    const donorIdInput = document.getElementById('donorIdBank');
    const donorInfoDiv = document.createElement('div');
    donorInfoDiv.className = 'donor-info';
    donorIdInput.parentNode.appendChild(donorInfoDiv);
    
    let debounceTimeout;
    donorIdInput.addEventListener('input', async (e) => {
        clearTimeout(debounceTimeout);
        const donorId = e.target.value.trim();
        
        if (donorId.length < 3) {
            donorInfoDiv.innerHTML = '';
            return;
        }
        
        debounceTimeout = setTimeout(async () => {
            try {
                const response = await apiCall(`/donors/${donorId}`);
                if (!response.ok) {
                    throw new Error('Donor not found');
                }
                
                const donor = await response.json();
                
                // Check donation eligibility
                const lastDonation = donor.lastDonation ? new Date(donor.lastDonation) : null;
                if (lastDonation) {
                    const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
                        donorInfoDiv.innerHTML = `
                            <div class="error-message">
                                Donor must wait ${MIN_DONATION_INTERVAL_DAYS - daysSinceLastDonation} more days before donating
                            </div>
                        `;
                        return;
                    }
                }
                
                donorInfoDiv.innerHTML = `
                    <div class="donor-details">
                        <p><strong>Name:</strong> ${donor.name}</p>
                        <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                        <p><strong>Last Donation:</strong> ${lastDonation ? lastDonation.toLocaleDateString() : 'Never'}</p>
                    </div>
                `;
            } catch (error) {
                donorInfoDiv.innerHTML = `
                    <div class="error-message">
                        ${error.message}
                    </div>
                `;
            }
        }, 500);
    });
}

// Show donor information
async function showDonorInfo(donorId) {
    const donorInfoDiv = document.getElementById('donorInfo');
    donorInfoDiv.innerHTML = '<div class="loading">Loading donor information...</div>';

    clearTimeout(window.donorInfoTimeout);
    window.donorInfoTimeout = setTimeout(async () => {
        try {
            const response = await apiCall(`/donors/${donorId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch donor information');
            }
            const donor = await response.json();

            // Check last donation date
            if (donor.lastDonation) {
                const lastDonation = new Date(donor.lastDonation);
                const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
                
                if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
                    donorInfoDiv.innerHTML = `
                        <div class="error-message">
                            Donor must wait ${MIN_DONATION_INTERVAL_DAYS - daysSinceLastDonation} more days before donating
                        </div>
                    `;
                    return;
                }
            }
            
            donorInfoDiv.innerHTML = `
                <div class="donor-details">
                    <p><strong>Name:</strong> ${donor.name}</p>
                    <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                    <p><strong>Last Donation:</strong> ${lastDonation ? lastDonation.toLocaleDateString() : 'Never'}</p>
                </div>
            `;
        } catch (error) {
            donorInfoDiv.innerHTML = `
                <div class="error-message">
                    ${error.message}
                </div>
            `;
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const donationForm = document.getElementById('donationForm');
    const bloodGroupInput = document.getElementById('bloodGroup');
    const quantityInput = document.getElementById('quantity');
    const dateInput = document.getElementById('date');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');

    // Get user data from server-side session
    const userData = window.userData;

    // Validate form
    function validateForm() {
        const bloodGroup = bloodGroupInput.value;
        const quantity = quantityInput.value.trim();
        const date = dateInput.value;

        let isValid = true;

        // Blood group validation
        if (!bloodGroup) {
            showError('Please select blood group');
            bloodGroupInput.classList.add('invalid');
            isValid = false;
        } else {
            bloodGroupInput.classList.remove('invalid');
        }

        // Quantity validation
        if (!quantity) {
            showError('Please enter quantity');
            quantityInput.classList.add('invalid');
            isValid = false;
        } else if (isNaN(quantity) || quantity < 1 || quantity > 2) {
            showError('Quantity must be between 1 and 2 units');
            quantityInput.classList.add('invalid');
            isValid = false;
        } else {
            quantityInput.classList.remove('invalid');
        }

        // Date validation
        if (!date) {
            showError('Please select date');
            dateInput.classList.add('invalid');
            isValid = false;
        } else {
            const selectedDate = new Date(date);
            const today = new Date();
            if (selectedDate > today) {
                showError('Date cannot be in the future');
                dateInput.classList.add('invalid');
                isValid = false;
            } else {
                dateInput.classList.remove('invalid');
            }
        }

        // If all validations pass, enable the button
        submitBtn.disabled = !isValid;
        if (isValid) {
            hideError();
        }

        return isValid;
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        successMessage.classList.remove('active');
    }

    // Show success message
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.add('active');
        errorMessage.classList.remove('active');
    }

    // Hide error message
    function hideError() {
        errorMessage.classList.remove('active');
    }

    // Event Listeners
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            } else {
                submitBtn.disabled = true;
                submitBtn.querySelector('.loading-spinner').classList.add('active');
                submitBtn.querySelector('.btn-text').textContent = 'Submitting...';
            }
        });
    }

    // Input validation on change
    if (bloodGroupInput) bloodGroupInput.addEventListener('change', validateForm);
    if (quantityInput) quantityInput.addEventListener('input', validateForm);
    if (dateInput) dateInput.addEventListener('change', validateForm);

    // Initialize
    validateForm();
});