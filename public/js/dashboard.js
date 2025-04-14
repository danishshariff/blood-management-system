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
        console.log('Donation Stats:', statsData);
        
        if (statsData.success) {
            updateDonationStats(statsData.data);
        }
        
        // Fetch donation history
        const historyResponse = await fetch('/api/donations/history');
        const historyData = await historyResponse.json();
        console.log('Donation History:', historyData);
        
        if (historyData.success) {
            updateDonationHistory(historyData.data);
        }
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Error loading dashboard data');
    }
}

function updateDonationStats(stats) {
    console.log('Updating donation stats:', stats);
    
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

    // Update next donation date and eligibility
    const nextDateElement = document.getElementById('nextDonationDate');
    const eligibilityElement = document.getElementById('eligibilityStatus');
    
    if (nextDateElement && eligibilityElement) {
        console.log('Last donation date:', stats.lastDonationDate);
        
        if (stats.lastDonationDate) {
            const lastDonation = new Date(stats.lastDonationDate);
            const today = new Date();
            const daysSinceLastDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
            
            console.log('Days since last donation:', daysSinceLastDonation);
            
            if (daysSinceLastDonation < 56) {
                const nextEligibleDate = new Date(lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000));
                const daysLeft = Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24));
                
                console.log('Next eligible date:', nextEligibleDate);
                console.log('Days left:', daysLeft);
                
                nextDateElement.textContent = nextEligibleDate.toLocaleDateString();
                eligibilityElement.textContent = `Not eligible yet. ${daysLeft} days left`;
                eligibilityElement.className = 'status status-ineligible';

                // Update countdown every day
                setInterval(() => {
                    const now = new Date();
                    const newDaysLeft = Math.ceil((nextEligibleDate - now) / (1000 * 60 * 60 * 24));
                    if (newDaysLeft > 0) {
                        eligibilityElement.textContent = `Not eligible yet. ${newDaysLeft} days left`;
                    } else {
                        eligibilityElement.textContent = 'Eligible to donate';
                        eligibilityElement.className = 'status status-eligible';
                        nextDateElement.textContent = 'You can donate anytime';
                    }
                }, 24 * 60 * 60 * 1000); // Update every 24 hours
            } else {
                nextDateElement.textContent = 'You can donate anytime';
                eligibilityElement.textContent = 'Eligible to donate';
                eligibilityElement.className = 'status status-eligible';
            }
        } else {
            // If no last donation date but we have donations, use today's date
            if (stats.total > 0) {
                const today = new Date();
                const nextEligibleDate = new Date(today.getTime() + (56 * 24 * 60 * 60 * 1000));
                nextDateElement.textContent = nextEligibleDate.toLocaleDateString();
                eligibilityElement.textContent = 'Not eligible yet. 56 days left';
                eligibilityElement.className = 'status status-ineligible';
            } else {
                // If no donations at all, show eligible
                nextDateElement.textContent = 'You can donate anytime';
                eligibilityElement.textContent = 'Eligible to donate';
                eligibilityElement.className = 'status status-eligible';
            }
        }
    }
}

function updateDonationHistory(donations) {
    const tbody = document.getElementById('donationHistoryBody');
    if (!tbody) return;

    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No donation history found</td></tr>';
        return;
    }

    tbody.innerHTML = donations.map(donation => `
        <tr>
            <td>${new Date(donation.donation_date).toLocaleDateString()}</td>
            <td>${donation.blood_group}</td>
            <td>${donation.quantity} units</td>
            <td>${donation.bank_name}</td>
        </tr>
    `).join('');
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