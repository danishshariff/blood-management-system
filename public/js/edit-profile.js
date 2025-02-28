document.addEventListener('DOMContentLoaded', () => {
    // Load common navigation code (hamburger menu) as before...
    fetch('hamburger.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        document.getElementById('commonNav').innerHTML = html;
        
        // Override page title for Edit Profile page
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          pageTitle.innerHTML = 'Edit Profile <span class="user-name">Danish Shariff</span>';
        }
        
        // Initialize sidebar toggle logic
        const openSidebarBtn = document.getElementById('openSidebar');
        const closeSidebarBtn = document.getElementById('closeSidebar');
        const sidebar = document.getElementById('sidebar');
        if (openSidebarBtn && closeSidebarBtn && sidebar) {
          openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('sidebar-active');
          });
          closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-active');
          });
          document.addEventListener('click', (e) => {
            if (
              sidebar.classList.contains('sidebar-active') &&
              !sidebar.contains(e.target) &&
              !openSidebarBtn.contains(e.target)
            ) {
              sidebar.classList.remove('sidebar-active');
            }
          });
        }
      })
      .catch(err => console.error('Error loading common navigation:', err));
  
    // Define default values as per your system
    const defaults = {
      name: "Danish Shariff",
      email: "danishshariff92@gmail.com",
      phone: "+880 1234 567890",
      age: "26",
      gender: "Male",
      bloodGroup: "A+",
      role: "Donor",
      status: "Active",
      address: "123 Main St, Feni Sadar, Feni",
      lastDonation: "2025-01-10"
    };
  
    // Try to load existing user profile data from localStorage.
    // If none exists, use the default values.
    const existingData = JSON.parse(localStorage.getItem('userProfile')) || {};
  
    document.getElementById('name').value = existingData.name || defaults.name;
    document.getElementById('email').value = existingData.email || defaults.email;
    document.getElementById('phone').value = existingData.phone || defaults.phone;
    document.getElementById('age').value = existingData.age || defaults.age;
    document.getElementById('gender').value = existingData.gender || defaults.gender;
    document.getElementById('bloodGroup').value = existingData.bloodGroup || defaults.bloodGroup;
    document.getElementById('role').value = existingData.role || defaults.role;
    document.getElementById('status').value = existingData.status || defaults.status;
    document.getElementById('address').value = existingData.address || defaults.address;
    document.getElementById('lastDonation').value = existingData.lastDonation || defaults.lastDonation;
  
    // Save changes on form submission
    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const userProfile = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        role: document.getElementById('role').value,
        status: document.getElementById('status').value,
        address: document.getElementById('address').value,
        lastDonation: document.getElementById('lastDonation').value
      };
  
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      // Redirect to profile page to view updated info
      window.location.href = 'profile.html';
    });
  });
  