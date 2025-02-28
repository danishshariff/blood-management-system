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
        // Override the default page title for Request Blood page
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          pageTitle.innerHTML = 'Request Blood <span class="user-name">Danish Shariff</span>';
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
            if (sidebar.classList.contains('sidebar-active') &&
                !sidebar.contains(e.target) &&
                !openSidebarBtn.contains(e.target)) {
              sidebar.classList.remove('sidebar-active');
            }
          });
        }
      })
      .catch(err => console.error('Error loading common navigation:', err));

    // Handle Request Blood form submission (simulate submission)
    document.getElementById('requestBloodForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert("Blood request submitted successfully!");
      this.reset();
    });
  });