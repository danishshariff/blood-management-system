document.addEventListener('DOMContentLoaded', function() {
    // Initialize form
    const form = document.getElementById('directRequestForm');
    const submitBtn = document.getElementById('submitRequest');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const errorMessage = document.getElementById('errorMessage');
    const successModal = document.getElementById('successModalOverlay');
    const closeModalBtn = document.getElementById('closeSuccessModal');

    // Load blood banks for dropdown
    loadBloodBanks();

    // Set minimum date for required date input to today
    const requiredDateInput = document.getElementById('requiredDate');
    if (requiredDateInput) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        requiredDateInput.min = today.toISOString().slice(0, 16);
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        submitBtn.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        btnText.textContent = 'Submitting...';
        errorMessage.style.display = 'none';

        try {
            const formData = {
                requester_name: form.requester_name.value,
                contact_no: form.contact_no.value,
                blood_group: form.blood_group.value,
                quantity: parseInt(form.quantity.value),
                reason: form.reason.value,
                bank_id: form.bank_id.value,
                urgency: form.urgency.value
            };

            const response = await fetch('/api/requests/direct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Show success modal
                successModal.style.display = 'flex';
                // Reset form
                form.reset();
            } else {
                throw new Error(data.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            errorMessage.textContent = error.message || 'An error occurred while submitting your request';
            errorMessage.style.display = 'block';
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            btnText.textContent = 'Submit Request';
        }
    });

    // Close modal handler
    closeModalBtn.addEventListener('click', function() {
        successModal.style.display = 'none';
    });

    // Close modal when clicking outside
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    // Phone number validation
    const phoneInput = document.getElementById('contact_no');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            let value = e.target.value.replace(/\D/g, '');
            
            // Format the number
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
                }
            }
            
            e.target.value = value;
        });
    }
});

async function loadBloodBanks() {
    console.log('Starting to load blood banks...');
    try {
        console.log('Fetching from /api/banks...');
        const response = await fetch('/api/banks');
        const data = await response.json();
        console.log('Received data:', data);

        if (data.success) {
            const bankSelect = document.getElementById('bank_id');
            console.log('Found bank select element:', bankSelect);
            
            data.data.forEach(bank => {
                console.log('Processing bank:', bank);
                const option = document.createElement('option');
                option.value = bank.bank_id;
                option.textContent = `${bank.name} - ${bank.city}`;
                bankSelect.appendChild(option);
            });
            console.log('Finished loading blood banks');
        } else {
            console.error('Failed to load blood banks:', data.message);
        }
    } catch (error) {
        console.error('Error loading blood banks:', error);
    }
} 