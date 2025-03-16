document.addEventListener('DOMContentLoaded', function() {
    // Constants
    let captchaText = '';

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    const captchaTextElement = document.getElementById('captchaText');
    const reloadCaptchaBtn = document.getElementById('reloadCaptcha');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const togglePasswordBtn = document.querySelector('.toggle-password');

    // Generate random captcha
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        captchaText = '';
        for (let i = 0; i < 6; i++) {
            captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaTextElement.textContent = captchaText;
    }

    // Display captcha
    function displayCaptcha() {
        generateCaptcha();
        captchaTextElement.style.background = '#f8f9fa';
        captchaTextElement.style.padding = '0.75rem 1rem';
        captchaTextElement.style.borderRadius = '5px';
        captchaTextElement.style.fontFamily = "'Courier New', monospace";
        captchaTextElement.style.fontSize = '1.2rem';
        captchaTextElement.style.letterSpacing = '2px';
        captchaTextElement.style.color = '#2c3e50';
    }

    // Validate form
    function validateForm() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const captcha = captchaInput.value.trim();

        // Email validation
        if (!email) {
            showError('Please enter your email address');
            emailInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            emailInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        emailInput.classList.remove('invalid');

        // Password validation
        if (!password) {
            showError('Please enter your password');
            passwordInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            passwordInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        passwordInput.classList.remove('invalid');

        // Captcha validation
        if (!captcha) {
            showError('Please enter the captcha code');
            captchaInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        if (captcha !== captchaText) {
            showError('Invalid captcha code');
            captchaInput.classList.add('invalid');
            loginBtn.disabled = true;
            return false;
        }
        captchaInput.classList.remove('invalid');

        // If all validations pass, enable the button
        loginBtn.disabled = false;
        hideError();
        return true;
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
    }

    // Hide error message
    function hideError() {
        errorMessage.classList.remove('active');
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Toggle password visibility
    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.classList.toggle('fa-eye');
        togglePasswordBtn.classList.toggle('fa-eye-slash');
    }

    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!validateForm()) {
                return;
            }

            try {
                loginBtn.disabled = true;
                loginBtn.querySelector('.loading-spinner').classList.add('active');
                loginBtn.querySelector('.btn-text').textContent = 'Logging in...';

                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: emailInput.value.trim(),
                        password: passwordInput.value.trim()
                    })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                if (data.success) {
                    // Redirect to the appropriate page
                    window.location.href = data.redirectUrl;
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            } catch (error) {
                showError(error.message);
                loginBtn.disabled = false;
                loginBtn.querySelector('.loading-spinner').classList.remove('active');
                loginBtn.querySelector('.btn-text').textContent = 'Login';
            }
        });
    }

    if (reloadCaptchaBtn) {
        reloadCaptchaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            displayCaptcha();
            captchaInput.value = '';
            validateForm();
        });
    }

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Input validation on change
    if (emailInput) emailInput.addEventListener('input', validateForm);
    if (passwordInput) passwordInput.addEventListener('input', validateForm);
    if (captchaInput) captchaInput.addEventListener('input', validateForm);

    // Initialize
    displayCaptcha();
}); 