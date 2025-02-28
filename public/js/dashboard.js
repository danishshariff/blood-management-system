document.addEventListener('DOMContentLoaded', () => {
    fetch('hamburger.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('commonNav').innerHTML = html;
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          pageTitle.innerHTML = 'Welcome to Dashboard <span class="user-name">Danish Shariff</span>';
        }
        // Initialize sidebar toggle logic:
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
            if (sidebar.classList.contains('sidebar-active') &&
                !sidebar.contains(e.target) &&
                !openSidebarBtn.contains(e.target)) {
              sidebar.classList.remove('sidebar-active');
            }
          });
        }
      })
      .catch(err => console.error('Error loading common navigation:', err));
  });
  

  // (Optional) Load user name from localStorage if you want
  const userData = JSON.parse(localStorage.getItem('userProfile')) || {};
  const dashUserName = document.getElementById('dashUserName');
  dashUserName.textContent = userData.name || 'Danish Shariff';