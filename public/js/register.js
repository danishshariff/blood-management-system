document.addEventListener('DOMContentLoaded', function() {
    // Load navigation
    fetch('components/nav.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('commonNav').innerHTML = data;
        })
        .catch(error => console.error('Error loading navigation:', error));

    // Constants
    const CAPTCHA_LENGTH = 6;

    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const roleButtons = document.querySelectorAll('.role-btn');
    const roleInput = document.getElementById('role');
    const donorFields = document.getElementById('donorFields');
    const bbsFields = document.getElementById('bbsFields');

    // Common Fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const genderInput = document.getElementById('gender');
    const ageInput = document.getElementById('age');
    const profilePicInput = document.getElementById('profilePic');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const captchaInput = document.getElementById('captcha');
    const captchaText = document.getElementById('captchaText');
    const reloadCaptchaBtn = document.getElementById('reloadCaptcha');
    const termsCheckbox = document.getElementById('terms');
    const registerBtn = document.getElementById('registerBtn');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Donor Fields
    const bloodGroupInput = document.getElementById('bloodGroup');
    const lastDonationInput = document.getElementById('lastDonation');
    const donorStatusInput = document.getElementById('donorStatus');

    // BBS Fields
    const bankIdInput = document.getElementById('bankId');
    const staffIdInput = document.getElementById('staffId');
    const positionInput = document.getElementById('position');
    const shiftInput = document.getElementById('shift');
    const certificationsInput = document.getElementById('certifications');

    // State
    let currentCaptcha = '';
    let currentRole = 'donor';

    // Generate random captcha text
    function generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let captcha = '';
        for (let i = 0; i < CAPTCHA_LENGTH; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }

    // Function to show field error
    function showFieldError(field, message) {
        // Create error element if it doesn't exist
        let errorElement = field.parentElement.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentElement.appendChild(errorElement);
        }
        
        // Show error message
        errorElement.textContent = message;
        errorElement.classList.add('show');
        field.classList.add('invalid');
    }

    // Function to hide field error
    function hideFieldError(field) {
        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        field.classList.remove('invalid');
    }

    // Validate form inputs
    function validateForm() {
        let isValid = true;
        
        // Common validations
        if (firstNameInput.value.trim().length < 2) {
            showFieldError(firstNameInput, 'First name must be at least 2 characters long');
            isValid = false;
        } else {
            hideFieldError(firstNameInput);
        }

        if (lastNameInput.value.trim().length < 2) {
            showFieldError(lastNameInput, 'Last name must be at least 2 characters long');
            isValid = false;
        } else {
            hideFieldError(lastNameInput);
        }

        if (!isValidEmail(emailInput.value.trim())) {
            showFieldError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            hideFieldError(emailInput);
        }

        if (!isValidPhone(phoneInput.value.trim())) {
            showFieldError(phoneInput, 'Please enter a valid 10-digit phone number');
            isValid = false;
        } else {
            hideFieldError(phoneInput);
        }

        if (addressInput.value.trim().length < 10) {
            showFieldError(addressInput, 'Address must be at least 10 characters long');
            isValid = false;
        } else {
            hideFieldError(addressInput);
        }

        if (!genderInput.value) {
            showFieldError(genderInput, 'Please select your gender');
            isValid = false;
        } else {
            hideFieldError(genderInput);
        }

        if (ageInput.value < 18) {
            showFieldError(ageInput, 'You must be at least 18 years old');
            isValid = false;
        } else {
            hideFieldError(ageInput);
        }

        if (!isValidPassword(passwordInput.value)) {
            showFieldError(passwordInput, 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            isValid = false;
        } else {
            hideFieldError(passwordInput);
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            showFieldError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        } else {
            hideFieldError(confirmPasswordInput);
        }

        // Captcha validation
        const enteredCaptcha = captchaInput.value.trim();
        if (enteredCaptcha !== currentCaptcha) {
            showFieldError(captchaInput, 'Please enter the correct captcha code');
            isValid = false;
        } else {
            hideFieldError(captchaInput);
        }

        // Terms validation
        const termsError = document.querySelector('.terms-error');
        if (!termsCheckbox.checked) {
            if (!termsError) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error terms-error';
                errorDiv.textContent = 'Please accept the terms and conditions';
                termsCheckbox.parentElement.appendChild(errorDiv);
            }
            termsError?.classList.add('show');
            isValid = false;
        } else {
            termsError?.classList.remove('show');
        }

        // Role-specific validations
        if (currentRole === 'donor') {
            if (!bloodGroupInput.value) {
                showFieldError(bloodGroupInput, 'Please select your blood group');
                isValid = false;
            } else {
                hideFieldError(bloodGroupInput);
            }

            if (!donorStatusInput.value) {
                showFieldError(donorStatusInput, 'Please select your donor status');
                isValid = false;
            } else {
                hideFieldError(donorStatusInput);
            }
        } else {
            if (!bankIdInput.value.trim()) {
                showFieldError(bankIdInput, 'Please enter a valid bank ID');
                isValid = false;
            } else {
                hideFieldError(bankIdInput);
            }
        }

        registerBtn.disabled = !isValid;
        return isValid;
    }

    // Display captcha on the page
    function displayCaptcha() {
        const newCaptcha = generateCaptcha();
        currentCaptcha = newCaptcha; // Update the current captcha
        
        const captchaText = document.getElementById('captchaText');
        if (captchaText) {
            captchaText.textContent = currentCaptcha;
            captchaText.style.fontSize = '24px';
            captchaText.style.letterSpacing = '3px';
            captchaText.style.fontWeight = 'bold';
            captchaText.style.color = '#333';
            captchaText.style.backgroundColor = '#f0f0f0';
            captchaText.style.padding = '10px';
            captchaText.style.borderRadius = '4px';
            captchaText.style.display = 'inline-block';
        }
        
        // Clear captcha input
        if (captchaInput) {
            captchaInput.value = '';
        }
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number format
    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    }

    // Validate password strength
    function isValidPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    // Calculate age from date of birth
    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Switch role
    function switchRole(role) {
        currentRole = role === 'bbs' ? 'blood_bank_staff' : role;
        
        // Update UI
        roleButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });
        
        if (role === 'donor') {
            donorFields.style.display = 'block';
            donorFields.classList.add('active');
            bbsFields.style.display = 'none';
            bbsFields.classList.remove('active');
            
            // Make donor fields required
            bloodGroupInput.required = true;
            donorStatusInput.required = true;
            
            // Make BBS fields not required
            bankIdInput.required = false;
            
            // Update labels to show required fields
            document.querySelector('label[for="bloodGroup"]').classList.add('required');
            document.querySelector('label[for="donorStatus"]').classList.add('required');
            document.querySelector('label[for="bankId"]').classList.remove('required');
        } else {
            bbsFields.style.display = 'block';
            bbsFields.classList.add('active');
            donorFields.style.display = 'none';
            donorFields.classList.remove('active');
            
            // Make BBS fields required
            bankIdInput.required = true;
            
            // Make donor fields not required
            bloodGroupInput.required = false;
            donorStatusInput.required = false;
            
            // Update labels to show required fields
            document.querySelector('label[for="bankId"]').classList.add('required');
            document.querySelector('label[for="bloodGroup"]').classList.remove('required');
            document.querySelector('label[for="donorStatus"]').classList.remove('required');
        }
        
        validateForm();
    }

    // Show error message
    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#dc3545';
        errorMessage.style.backgroundColor = '#f8d7da';
        errorMessage.style.borderColor = '#f5c6cb';
        errorMessage.style.padding = '10px';
        errorMessage.style.borderRadius = '4px';
        errorMessage.style.marginBottom = '15px';
    }

    // Hide error message
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Show success message
    function showSuccess(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#28a745';
        errorMessage.style.backgroundColor = '#d4edda';
        errorMessage.style.borderColor = '#c3e6cb';
        errorMessage.style.padding = '10px';
        errorMessage.style.borderRadius = '4px';
        errorMessage.style.marginBottom = '15px';
    }

    // Set loading state
    function setLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.style.display = 'inline-block';
            btnText.style.display = 'none';
            registerBtn.disabled = true;
        } else {
            loadingSpinner.style.display = 'none';
            btnText.style.display = 'inline-block';
            registerBtn.disabled = false;
        }
    }

    // Toggle password visibility
    function togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.parentElement.querySelector('.toggle-password');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }

    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Double-check captcha before submission
        const enteredCaptcha = captchaInput.value.trim();
        if (enteredCaptcha !== currentCaptcha) {
            showError('Please enter the correct captcha code');
            return;
        }
        
        try {
            if (!validateForm()) {
                return;
            }

            // Show loading state
            setLoading(true);

            // Prepare form data
            const formData = new FormData();
            formData.append('name', `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`);
            formData.append('email', emailInput.value.trim());
            formData.append('contact_no', phoneInput.value.trim());
            formData.append('address', addressInput.value.trim());
            formData.append('gender', genderInput.value);
            formData.append('age', ageInput.value);
            formData.append('password', passwordInput.value);
            formData.append('role', currentRole);

            if (profilePicInput.files[0]) {
                formData.append('profile_picture', profilePicInput.files[0]);
            }

            if (currentRole === 'donor') {
                formData.append('blood_group', bloodGroupInput.value);
                formData.append('status', donorStatusInput.value);
                if (lastDonationInput.value) {
                    formData.append('last_donation_date', lastDonationInput.value);
                }
            } else {
                formData.append('bank_id', bankIdInput.value.trim());
            }
            
            // Send registration request
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Registration failed');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            // Show success modal and redirect
            const successModal = document.getElementById('successModal');
            const successModalOverlay = document.getElementById('successModalOverlay');
            if (successModal && successModalOverlay) {
                successModalOverlay.style.display = 'flex';
                successModal.style.display = 'block';

                // Add click event to OK button
                const closeButton = document.getElementById('closeSuccessModal');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        window.location.href = '/login';
                    });
                }
            } else {
                // Fallback if modal elements don't exist
                showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }

        } catch (error) {
            console.error('Registration error:', error);
            showError(error.message || 'Registration failed. Please try again.');
            // Generate new captcha on error
            displayCaptcha();
        } finally {
            setLoading(false);
        }
    }

    // Event Listeners
    registerForm.addEventListener('submit', handleSubmit);

    // Role selection listeners
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchRole(btn.dataset.role);
            validateForm(); // Validate form after role switch
        });
    });

    // Add input event listeners for real-time validation
    const inputs = [
        firstNameInput, lastNameInput, emailInput, phoneInput, 
        addressInput, genderInput, ageInput, passwordInput, 
        confirmPasswordInput, captchaInput, bloodGroupInput, 
        donorStatusInput, bankIdInput
    ];

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                validateForm();
            });
        }
    });

    // Add change event listener for terms checkbox
    termsCheckbox.addEventListener('change', validateForm);

    reloadCaptchaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        displayCaptcha();
    });

    // Password toggle listeners
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const inputId = btn.parentElement.querySelector('input').id;
            togglePasswordVisibility(inputId);
        });
    });

    // Initialize with donor role and validate form
    switchRole('donor');
    displayCaptcha(); // Display initial captcha
    validateForm();
});
  
  