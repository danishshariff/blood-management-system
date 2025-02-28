document.addEventListener('DOMContentLoaded', () => {
    // Fetch the common navigation from hamburger.html
    fetch('hamburger.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        // Insert the fetched HTML into the placeholder div with id="commonNav"
        const navContainer = document.getElementById('commonNav');
        if (navContainer) {
          navContainer.innerHTML = html;
        }
        
        // Now override the default page title set in hamburger.html
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          // Set the title for the Profile page
          pageTitle.innerHTML = 'My Profile <span class="user-name">Danish Shariff</span>';
        }
        
        // Initialize sidebar toggle functionality after the navigation is loaded
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
  });
  
  
    
  
    // READ from localStorage and update the page
    const userData = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    // Fallback if data is missing
    document.getElementById('pName').textContent = userData.name || 'Danish Shariff';
    document.getElementById('pEmail').textContent = userData.email || 'danishshariff92@gmail.com';
    document.getElementById('pPhone').textContent = userData.phone || '+880 1234 567890';
    document.getElementById('pAge').textContent = userData.age || '26';
    document.getElementById('pGender').textContent = userData.gender || 'Male';
    document.getElementById('pBloodGroup').textContent = userData.bloodGroup || 'A+';
    document.getElementById('pRole').textContent = userData.role || 'Donor';
    document.getElementById('pStatus').textContent = userData.status || 'Active';
    document.getElementById('pAddress').textContent = userData.address || '123 Main St, Feni Sadar, Feni';
    document.getElementById('pLastDonation').textContent = userData.lastDonation || '2025-01-10';
  
    // If we stored a photo in base64, we can load it
    if (userData.photo) {
      document.getElementById('profilePhoto').src = userData.photo;
    }
  
    // Also update the top bar name if needed
    document.getElementById('profileUserName').textContent = userData.name || 'Danish Shariff';