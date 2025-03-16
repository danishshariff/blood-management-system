// Constants
const API_URL = 'http://localhost:3000/api';

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch(`${window.API_URL}/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        const userData = await response.json();
        populateForm(userData);
        showRoleSpecificFields(userData.role);
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

// Show/hide role-specific fields
function showRoleSpecificFields(role) {
    const donorFields = document.getElementById('donorFields');
    const bbsFields = document.getElementById('bbsFields');
    
    if (role.toLowerCase() === 'donor') {
        donorFields.style.display = 'block';
        bbsFields.style.display = 'none';
        
        // Make donor fields required
        document.getElementById('bloodGroup').required = true;
        document.getElementById('weight').required = true;
        document.getElementById('donorStatus').required = true;
        
        // Make BBS fields not required
        document.getElementById('bankId').required = false;
        document.getElementById('staffId').required = false;
        document.getElementById('position').required = false;
        document.getElementById('shift').required = false;
    } else {
        donorFields.style.display = 'none';
        bbsFields.style.display = 'block';
        
        // Make BBS fields required
        document.getElementById('bankId').required = true;
        document.getElementById('staffId').required = true;
        document.getElementById('position').required = true;
        document.getElementById('shift').required = true;
        
        // Make donor fields not required
        document.getElementById('bloodGroup').required = false;
        document.getElementById('weight').required = false;
        document.getElementById('donorStatus').required = false;
    }
}

// Populate form with user data
function populateForm(userData) {
    const form = document.getElementById('editProfileForm');
    if (!form) return;

    // Update common fields
    form.elements.name.value = userData.name || '';
    form.elements.email.value = userData.email || '';
    form.elements.phone.value = userData.phone || '';
    form.elements.age.value = userData.age || '';
    form.elements.gender.value = userData.gender || '';
    form.elements.address.value = userData.address || '';

    // Update role-specific fields
    if (userData.role.toLowerCase() === 'donor') {
        form.elements.bloodGroup.value = userData.bloodGroup || '';
        form.elements.weight.value = userData.weight || '';
        form.elements.lastDonation.value = userData.lastDonation ? 
            new Date(userData.lastDonation).toISOString().split('T')[0] : '';
        form.elements.donorStatus.value = userData.donorStatus || 'Active';
        form.elements.medicalHistory.value = userData.medicalHistory || '';
    } else {
        form.elements.bankId.value = userData.bankId || '';
        form.elements.staffId.value = userData.staffId || '';
        form.elements.position.value = userData.position || '';
        form.elements.shift.value = userData.shift || '';
        form.elements.certifications.value = userData.certifications || '';
    }

    // Show current profile picture if exists
    const currentProfilePic = document.getElementById('currentProfilePic');
    if (currentProfilePic && userData.profilePicUrl) {
        currentProfilePic.src = userData.profilePicUrl;
        currentProfilePic.style.display = 'block';
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        setLoading(true);
        
        const response = await fetch(`${window.API_URL}/profile/update`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        const data = await response.json();
        if (data.success) {
            showSuccess('Profile updated successfully');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        } else {
            showError(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile');
    } finally {
        setLoading(false);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.main-content').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.main-content').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// Set loading state
function setLoading(isLoading) {
    const form = document.getElementById('editProfileForm');
    const saveBtn = form.querySelector('.save-btn');
    const cancelBtn = form.querySelector('.cancel-btn');
    
    if (isLoading) {
        saveBtn.disabled = true;
        cancelBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    } else {
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        saveBtn.innerHTML = 'Save Changes';
    }
}

// Handle profile picture preview
function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('Profile picture must be less than 5MB');
            event.target.value = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const currentProfilePic = document.getElementById('currentProfilePic');
            currentProfilePic.src = e.target.result;
            currentProfilePic.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editProfileForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    const profilePicInput = document.getElementById('profilePic');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicChange);
    }

    loadUserProfile();
});
  