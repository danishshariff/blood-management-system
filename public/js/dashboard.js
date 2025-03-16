document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Check role access
    checkRoleAccess('donor');
});

async function initializeDashboard() {
    try {
        // Fetch donation statistics
        const statsResponse = await fetch('/api/donations/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            updateDonationStats(statsData.data);
        }
        
        // Fetch donation history
        const historyResponse = await fetch('/api/donations/history');
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
            updateDonationHistory(historyData.data);
        }
        
        // Check donation eligibility
        const eligibilityResponse = await fetch('/api/donations/eligibility');
        const eligibilityData = await eligibilityResponse.json();
        
        if (eligibilityData.success) {
            updateEligibilityStatus(eligibilityData);
        }
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Error loading dashboard data');
    }
}

function updateDonationStats(stats) {
    // Update total donations
    const totalDonationsElement = document.getElementById('totalDonations');
    if (totalDonationsElement) {
        totalDonationsElement.textContent = stats.total || 0;
    }
    
    // Update total units donated
    const totalUnitsElement = document.getElementById('totalUnits');
    if (totalUnitsElement) {
        totalUnitsElement.textContent = stats.totalUnits || 0;
    }

    // Update next donation date
    const nextDateElement = document.getElementById('nextDonationDate');
    const eligibilityElement = document.getElementById('eligibilityStatus');
    
    if (nextDateElement && eligibilityElement) {
        if (stats.nextEligibleDate) {
            nextDateElement.textContent = new Date(stats.nextEligibleDate).toLocaleDateString();
            eligibilityElement.textContent = 'Not eligible yet';
            eligibilityElement.className = 'status status-ineligible';
        } else {
            nextDateElement.textContent = 'You can donate anytime';
            eligibilityElement.textContent = 'Eligible to donate';
            eligibilityElement.className = 'status status-eligible';
        }
    }
}

function updateDonationHistory(donations) {
    const tableBody = document.getElementById('donationHistoryBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (donations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No donation history found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(donation.donation_date).toLocaleDateString()}</td>
            <td>${donation.blood_group}</td>
            <td>${donation.quantity} unit(s)</td>
            <td>${donation.bank_name}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateEligibilityStatus(eligibilityData) {
    const eligibilityElement = document.getElementById('eligibilityStatus');
    const nextDateElement = document.getElementById('nextDonationDate');
    
    if (eligibilityElement) {
        eligibilityElement.textContent = eligibilityData.message;
        eligibilityElement.className = `status ${eligibilityData.eligible ? 'status-eligible' : 'status-ineligible'}`;
    }
    
    if (nextDateElement && eligibilityData.nextEligibleDate) {
        nextDateElement.textContent = new Date(eligibilityData.nextEligibleDate).toLocaleDateString();
    } else if (nextDateElement) {
        nextDateElement.textContent = 'You can donate anytime';
    }
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