document.addEventListener('DOMContentLoaded', () => {
    // Load hamburger.html (the common nav) into #commonNav
    fetch('hamburger.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        document.getElementById('commonNav').innerHTML = html;
        // Override the page title for the blog page
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          pageTitle.innerHTML = 'Blogs <span class="user-name">Danish Shariff</span>';
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

    // Simulate a search function (if you want to filter blog posts by title)
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        // In a real app, you'd fetch blog posts from the backend
        alert(`Searching blogs for: ${query}`);
      });
    }
  });