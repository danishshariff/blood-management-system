document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Initialize create request form
    initializeCreateRequestForm();
});

async function initializeDashboard() {
    try {
        // Fetch blood stock levels
        const stockResponse = await fetch('/api/banks/stock');
        const stockData = await stockResponse.json();
        
        if (stockData.success) {
            updateBloodStock(stockData.data);
        } else {
            showError(stockData.message || 'Failed to load blood stock data');
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Error loading dashboard data');
    }
}

function updateBloodStock(stockData) {
    const bloodStockGrid = document.getElementById('bloodStockGrid');
    if (!bloodStockGrid) return;
    
    bloodStockGrid.innerHTML = '';
    
    // Define all blood groups
    const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    
    // Create a map of existing stock data
    const stockMap = new Map(stockData.map(stock => [stock.blood_group, stock.quantity_available]));
    
    // Display all blood groups, even if they don't have stock entries
    allBloodGroups.forEach(bloodGroup => {
        const quantity = stockMap.get(bloodGroup) || 0;
        const stockLevel = getStockLevel(quantity);
        
        const stockBox = document.createElement('div');
        stockBox.className = `blood-stock-box ${stockLevel}`;
        stockBox.innerHTML = `
            <h3>${bloodGroup}</h3>
            <p class="stock-value">${quantity} units</p>
            <span class="stock-status">${stockLevel}</span>
            <button class="btn-request" onclick="showCreateRequestModal('${bloodGroup}')">
                Create Request
            </button>
        `;
        
        bloodStockGrid.appendChild(stockBox);
    });
}

function getStockLevel(quantity) {
    if (quantity <= 10) return 'critical';
    if (quantity <= 20) return 'low';
    if (quantity <= 50) return 'moderate';
    return 'good';
}

function showError(message) {
    const errorElement = document.getElementById('dashboardError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successElement = document.getElementById('dashboardSuccess');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
    console.log('Success message:', message);
}

function showCreateRequestModal(bloodGroup = '') {
    const modal = document.getElementById('createRequestModal');
    const bloodGroupSelect = document.getElementById('blood_group');
    
    if (modal && bloodGroupSelect) {
        if (bloodGroup) {
            bloodGroupSelect.value = bloodGroup;
        }
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function initializeCreateRequestForm() {
    const form = document.getElementById('createRequestForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');

        try {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Request...';

            const formData = {
                blood_group: form.blood_group.value,
                quantity: parseInt(form.quantity.value),
                urgency: form.urgency.value,
                reason: form.reason.value
            };
            console.log('Form data:', formData);

            const response = await fetch('/api/requests/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin'
            });
            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                showSuccess('Blood request created successfully');
                form.reset();
                closeModal('createRequestModal');
                initializeDashboard();
            } else {
                showError(data.message || 'Failed to create blood request');
            }
        } catch (error) {
            console.error('Error creating blood request:', error);
            showError('Error creating blood request. Please try again.');
        } finally {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Request';
        }
    });
}

// Process request/donation functions will be implemented when we add the modal functionality
function processRequest(requestId) {
    // Show request action modal
    const modal = document.getElementById('requestActionModal');
    if (modal) {
        modal.style.display = 'block';
        modal.dataset.requestId = requestId;
    }
}

function processDonation(donationId) {
    // Show donation action modal
    const modal = document.getElementById('donationActionModal');
    if (modal) {
        modal.style.display = 'block';
        modal.dataset.donationId = donationId;
    }
} 