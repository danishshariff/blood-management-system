// script.js

// Function to generate a random 6-character captcha
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Captcha functionality
    const captchaTextElement = document.querySelector('.captcha-text');
    if (captchaTextElement) {
        captchaTextElement.textContent = generateCaptcha();
    }

    const reloadBtn = document.querySelector('.reload-captcha');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', function(event) {
            event.preventDefault();
            captchaTextElement.textContent = generateCaptcha();
        });
    }

    // Slider functionality
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideCount = slides.length;

    function showSlide(index) {
        if (!slides.length) return;
        slides.forEach(slide => slide.style.display = 'none');
        if (dots.length) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }
        slides[index].style.display = 'block';
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(currentSlide);
    }

    // Initialize slider if elements exist
    if (slides.length) {
        // Auto slide
        setInterval(nextSlide, 5000);

        // Event listeners for slider
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Dot navigation
        if (dots.length) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                });
            });
        }

        // Show initial slide
        showSlide(currentSlide);
    }

    // Search functionality
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `/donor-available-requests?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }

    // Filter functionality
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        const locationFilter = document.getElementById('locationFilter');
        const bloodGroupFilter = document.getElementById('bloodGroupFilter');
        const statusFilter = document.getElementById('statusFilter');
        const emergencyFilter = document.getElementById('emergencyFilter');

        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const params = new URLSearchParams();
            
            if (locationFilter?.value) params.append('location', locationFilter.value);
            if (bloodGroupFilter?.value) params.append('bloodGroup', bloodGroupFilter.value);
            if (statusFilter?.value) params.append('status', statusFilter.value);
            if (emergencyFilter?.value) params.append('emergency', emergencyFilter.value);

            window.location.href = `/donor-available-requests?${params.toString()}`;
        });
    }

    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            accordionItem.classList.toggle('active');
        });
    });

    // Profile modal functionality
    const profilePicTrigger = document.getElementById('profilePicTrigger');
    const profileModalOverlay = document.getElementById('profileModalOverlay');
    const exitBtn = document.getElementById('exitBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    if (profilePicTrigger && profileModalOverlay) {
        // Show modal when profile pic is clicked
        profilePicTrigger.addEventListener('click', () => {
            profileModalOverlay.classList.add('active');
        });

        // Hide modal on "Exit" button
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                profileModalOverlay.classList.remove('active');
            });
        }

        // Log out logic
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // In a real app, you'd clear tokens/session and redirect
                alert('Logged out (front-end simulation)');
                profileModalOverlay.classList.remove('active');
            });
        }

        // Dashboard button
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        // Optional: Clicking outside the modal closes it
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) {
                profileModalOverlay.classList.remove('active');
            }
        });
    }
});
  