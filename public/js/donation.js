document.addEventListener('DOMContentLoaded', () => {
    fetch('hamburger.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        document.getElementById('commonNav').innerHTML = html;
        
        // Use a short delay to ensure the partial is fully inserted
        setTimeout(() => {
          const pageTitle = document.getElementById('pageTitle');
          if (pageTitle) {
            // Simulate reading user data from localStorage
            const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Danish Shariff', role: 'Donor' };
            if (userProfile.role === 'Donor') {
              pageTitle.innerHTML = 'Log Donation <span class="user-name">' + userProfile.name + '</span>';
            } else if (userProfile.role === 'BBS') {
              pageTitle.innerHTML = 'Record Donation <span class="user-name">' + userProfile.name + '</span>';
            }
          } else {
            console.error('No element with id "pageTitle" found!');
          }
        }, 100);
        
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
  
      
    // Simulate reading user data from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Danish Shariff', role: 'Donor' };
    
    // Update page title based on role
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      if (userProfile.role === 'Donor') {
        pageTitle.innerHTML = 'Log Donation <span class="user-name">' + userProfile.name + '</span>';
      } else if (userProfile.role === 'BBS') {
        pageTitle.innerHTML = 'Record Donation <span class="user-name">' + userProfile.name + '</span>';
      }
    }
    
    // Conditional display of sections based on role
    const donorSection = document.getElementById('donorSection');
    const bankSection = document.getElementById('bankSection');
    if (userProfile.role === 'Donor') {
      donorSection.style.display = 'block';
      bankSection.style.display = 'none';
    } else if (userProfile.role === 'BBS') {
      donorSection.style.display = 'none';
      bankSection.style.display = 'block';
    }
    
    // Handle donor donation form submission
    document.getElementById('donorDonationForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert("Donation logged successfully (Donor)!");
      this.reset();
    });
    
    // Handle bank donation form submission
    document.getElementById('bankDonationForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert("Donation recorded successfully (Bank)!");
      this.reset();
    });
  });