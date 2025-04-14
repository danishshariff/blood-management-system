// Authentication and authorization utilities
function checkRoleAccess(requiredRole) {
    // Get user role from session or local storage
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
        // Redirect to login if no role is found
        window.location.href = '/login';
        return;
    }
    
    if (userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        switch(userRole) {
            case 'donor':
                window.location.href = '/dashboard';
                break;
            case 'blood_bank_staff':
                window.location.href = '/bloodbank-dashboard';
                break;
            default:
                window.location.href = '/login';
        }
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/login';
} 