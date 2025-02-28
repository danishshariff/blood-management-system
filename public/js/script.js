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
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    let currentSlide = 0;
    
    function showSlide(index) {
      if (index < 0) {
        currentSlide = slides.length - 1;
      } else if (index >= slides.length) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    prevBtn.addEventListener('click', () => {
      showSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', () => {
      showSlide(currentSlide + 1);
    });
    
    // Start at the first slide
    showSlide(currentSlide);
    setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
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
  
  