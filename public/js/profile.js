// Constants
// DOM Elements
let profileForm;
let nameInput;
let emailInput;
let contactInput;
let addressInput;
let ageInput;
let genderSelect;
let bloodGroupSelect;
let bloodGroupContainer;
let submitBtn;
let errorMessage;
let successMessage;
let profileImage;
let profileImageInput;

// Current value elements
let currentName;
let currentEmail;
let currentContact;
let currentAddress;
let currentAge;
let currentGender;
let currentBloodGroup;

// Initialize DOM elements
function initializeElements() {
    profileForm = document.getElementById('profileForm');
    nameInput = document.getElementById('name');
    emailInput = document.getElementById('email');
    contactInput = document.getElementById('contact');
    addressInput = document.getElementById('address');
    ageInput = document.getElementById('age');
    genderSelect = document.getElementById('gender');
    bloodGroupSelect = document.getElementById('bloodGroup');
    bloodGroupContainer = document.getElementById('bloodGroupContainer');
    submitBtn = document.getElementById('submitBtn');
    errorMessage = document.getElementById('errorMessage');
    successMessage = document.getElementById('successMessage');
    profileImage = document.getElementById('profileImage');
    profileImageInput = document.getElementById('profileImageInput');

    // Current value elements
    currentName = document.getElementById('currentName');
    currentEmail = document.getElementById('currentEmail');
    currentContact = document.getElementById('currentContact');
    currentAddress = document.getElementById('currentAddress');
    currentAge = document.getElementById('currentAge');
    currentGender = document.getElementById('currentGender');
    currentBloodGroup = document.getElementById('currentBloodGroup');
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
}

// Show success message
function showSuccess(message) {
    console.log('Success:', message);
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
}

// Populate form with user data
function populateForm(userData) {
    console.log('Populating form with data:', userData);
    
    // Set input values
    nameInput.value = userData.name || '';
    emailInput.value = userData.email || '';
    contactInput.value = userData.contact_no || '';
    addressInput.value = userData.address || '';
    ageInput.value = userData.age || '';
    genderSelect.value = userData.gender || '';

    // Set current values
    currentName.textContent = userData.name || 'Not set';
    currentEmail.textContent = userData.email || 'Not set';
    currentContact.textContent = userData.contact_no || 'Not set';
    currentAddress.textContent = userData.address || 'Not set';
    currentAge.textContent = userData.age || 'Not set';
    currentGender.textContent = userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not set';

    // Handle blood group field based on role
    if (userData.role === 'donor') {
        bloodGroupContainer.style.display = 'block';
        bloodGroupSelect.value = userData.blood_group || '';
        currentBloodGroup.textContent = userData.blood_group || 'Not set';
    } else {
        bloodGroupContainer.style.display = 'none';
    }

    // Set profile image
    if (profileImage) {
        profileImage.src = userData.profile_picture || '/images/default-avatar.png';
        
        // Also update the nav profile picture if it exists
        const navProfilePic = document.getElementById('profilePic');
        if (navProfilePic) {
            navProfilePic.src = userData.profile_picture || '/images/default-avatar.png';
        }
    }
}

// Handle profile image upload
async function handleProfileImageUpload(file) {
    try {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showError('Profile picture must be less than 5MB');
            profileImageInput.value = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            profileImageInput.value = '';
            return;
        }

        console.log('Uploading profile picture...');
        const formData = new FormData();
        formData.append('profile_picture', file);

        const response = await fetch('/api/auth/profile', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload profile picture');
        }

        if (data.success) {
            showSuccess('Profile picture updated successfully');
            // Update the profile images
            if (data.user.profile_picture) {
                profileImage.src = data.user.profile_picture;
                const navProfilePic = document.getElementById('profilePic');
                if (navProfilePic) {
                    navProfilePic.src = data.user.profile_picture;
                }
            }
        } else {
            throw new Error(data.message || 'Failed to update profile picture');
        }
    } catch (error) {
        showError(error.message);
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(profileForm);
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

        const response = await fetch('/api/auth/profile', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        if (data.success) {
            showSuccess('Profile updated successfully');
            // Update the form with new data
            populateForm(data.user);
        } else {
            throw new Error(data.message || 'Failed to update profile');
        }
    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Profile';
    }
}

// Initialize the page
function initializePage() {
    console.log('Initializing profile page...');
    
    // Initialize DOM elements
    initializeElements();

    // Add event listeners
    if (profileForm) {
        profileForm.addEventListener('submit', handleSubmit);
    }

    if (profileImageInput) {
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleProfileImageUpload(file);
            }
        });
    }

    // Populate form with user data from window.userData
    if (window.userData) {
        populateForm(window.userData);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);