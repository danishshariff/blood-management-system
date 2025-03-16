// Load navigation and initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set up mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
    }

    // Set up profile dropdown
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Handle notifications
    const notificationBell = document.querySelector('.notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (notificationDropdown.classList.contains('show')) {
                notificationDropdown.classList.remove('show');
            }
        });
    }

    // Update navigation based on auth status
    updateNavigation();
});

// Update navigation based on auth status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const authRequired = document.querySelectorAll('.auth-required');
    const donorOnly = document.querySelectorAll('.donor-only');
    const bloodbankOnly = document.querySelectorAll('.bloodbank-only');
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profilePic = document.getElementById('profilePic');
    const userName = document.getElementById('userName');

    // Get user data from server-side session
    const userData = window.userData; // This will be set by EJS template

    if (userData) {
        // Hide login/register, show logout
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'flex';

        // First show all auth-required elements
        authRequired.forEach(el => {
            if (el) el.style.display = 'flex';
        });
        
        // Show/hide role-specific elements
        if (userData.role === 'donor') {
            donorOnly.forEach(el => {
                if (el) el.style.display = 'flex';
            });
            bloodbankOnly.forEach(el => {
                if (el) el.style.display = 'none';
            });
        } else if (userData.role === 'blood_bank_staff') {
            donorOnly.forEach(el => {
                if (el) el.style.display = 'none';
            });
            bloodbankOnly.forEach(el => {
                if (el) el.style.display = 'flex';
            });
        }

        // Update profile section
        if (profileBtn) {
            profileBtn.style.display = 'flex';
            profileBtn.style.visibility = 'visible';
        }
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
            profileDropdown.style.visibility = 'visible';
        }
        if (profilePic && userData.profile_picture) {
            profilePic.src = userData.profile_picture;
        }
        if (userName) userName.textContent = userData.name || 'User';
    } else {
        // Show login/register, hide logout
        if (loginLink) loginLink.style.display = 'flex';
        if (registerLink) registerLink.style.display = 'flex';
        if (logoutLink) logoutLink.style.display = 'none';

        // Hide authenticated elements
        authRequired.forEach(el => {
            if (el) el.style.display = 'none';
        });
        donorOnly.forEach(el => {
            if (el) el.style.display = 'none';
        });
        bloodbankOnly.forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Hide profile section
        if (profileBtn) {
            profileBtn.style.display = 'none';
            profileBtn.style.visibility = 'hidden';
        }
        if (profileDropdown) {
            profileDropdown.style.display = 'none';
            profileDropdown.style.visibility = 'hidden';
        }
    }
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/logout', {
            method: 'GET'
        });
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // If anything fails, redirect to home
        window.location.href = '/';
    }
}

// Initialize navigation
function initializeNavigation() {
    // Set up logout handler
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }

    // Set up mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
    }

    // Set up profile dropdown
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Handle notifications
    const notificationBell = document.querySelector('.notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (notificationDropdown.classList.contains('show')) {
                notificationDropdown.classList.remove('show');
            }
        });
    }

    // Update navigation based on auth status
    updateNavigation();
}

// Helper function for authenticated API calls
async function fetchWithAuth(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        ...options,
        credentials: 'same-origin' // Include cookies in the request
    });

    if (response.status === 401) {
        // Session expired or invalid
        window.location.href = '/login';
        throw new Error('Authentication expired');
    }

    return response;
} 