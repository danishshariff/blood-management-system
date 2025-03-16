// script.js

// Captcha Reload Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Generate an initial captcha on page load
    const captchaTextElement = document.querySelector('.captcha-text');
    if (captchaTextElement) {
      captchaTextElement.textContent = generateCaptcha();
    }
  
    // Set up the Reload Captcha link
    const reloadBtn = document.querySelector('.reload-captcha');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the link from navigating
        captchaTextElement.textContent = generateCaptcha();
      });
    }
  });
  
  // Function to generate a random 6-character captcha
  function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }
  
  // Add other JavaScript functionality here
  document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dots = document.querySelectorAll('.dot');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const filterForm = document.getElementById('filterForm');
    const locationFilter = document.getElementById('locationFilter');
    const bloodGroupFilter = document.getElementById('bloodGroupFilter');
    const statusFilter = document.getElementById('statusFilter');
    const emergencyFilter = document.getElementById('emergencyFilter');

    // Get user data from server-side session
    const userData = window.userData;

    // Slider functionality
    let currentSlide = 0;
    const slideCount = slides.length;

    function showSlide(index) {
        slides.forEach(slide => slide.style.display = 'none');
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].style.display = 'block';
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        showSlide(currentSlide);
    }

    // Auto slide
    setInterval(nextSlide, 5000);

    // Event listeners for slider
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // Search functionality
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `/donor-available-requests?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    }

    // Filter functionality
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const location = locationFilter.value;
            const bloodGroup = bloodGroupFilter.value;
            const status = statusFilter.value;
            const emergency = emergencyFilter.value;

            const params = new URLSearchParams();
            if (location) params.append('location', location);
            if (bloodGroup) params.append('bloodGroup', bloodGroup);
            if (status) params.append('status', status);
            if (emergency) params.append('emergency', emergency);

            window.location.href = `/donor-available-requests?${params.toString()}`;
        });
    }

    // Initialize
    showSlide(currentSlide);
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
  
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
  
        // If multiple can be open at once:
        accordionItem.classList.toggle('active');
  
        
      });
    });
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const profilePicTrigger = document.getElementById('profilePicTrigger');
    const profileModalOverlay = document.getElementById('profileModalOverlay');
    const exitBtn = document.getElementById('exitBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
  
    // Show modal when profile pic is clicked
    profilePicTrigger.addEventListener('click', () => {
      profileModalOverlay.classList.add('active');
    });
  
    // Hide modal on "Exit" button
    exitBtn.addEventListener('click', () => {
      profileModalOverlay.classList.remove('active');
    });
  
    // Log out logic (front-end only for now)
    logoutBtn.addEventListener('click', () => {
      // In a real app, you'd clear tokens/session and redirect
      alert('Logged out (front-end simulation)');
      profileModalOverlay.classList.remove('active');
    });
  
    // Dashboard button
    dashboardBtn.addEventListener('click', () => {
      // In a real app, redirect to the dashboard page
      window.location.href = 'dashboard.html';
    });
  
    // Optional: Clicking outside the modal closes it
    profileModalOverlay.addEventListener('click', (e) => {
      if (e.target === profileModalOverlay) {
        profileModalOverlay.classList.remove('active');
      }
    });
  });
  
  