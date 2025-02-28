document.addEventListener('DOMContentLoaded', () => {
    fetch('hamburger.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        // Insert the common navigation into the placeholder
        document.getElementById('commonNav').innerHTML = html;
        
        // Override the page title for the Blood Requests page
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
          pageTitle.innerHTML = 'Blood Requests <span class="user-name">Danish Shariff</span>';
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
      
    // Additional JavaScript for your blood request page (e.g., populating table, filtering, modals) would go here...
  });
const requestsData = [
  {
    recipientName: 'Trishon',
    bloodGroup: 'O+',
    dateTime: '2023-11-17 (11:12)',
    hospitalName: 'CMC',
    fullAddress: 'TERII college, Bagmara, Rajshahi',
    reason: 'Emergency need',
    donationStatus: 'inprogress'
  },
  {
    recipientName: 'Rakihi',
    bloodGroup: 'B+',
    dateTime: '2023-12-01 (13:08)',
    hospitalName: 'Dhaka Medical',
    fullAddress: 'Some address in Dhaka',
    reason: 'Urgent Surgery',
    donationStatus: 'done'
  },
  // Add more as needed...
];

document.addEventListener('DOMContentLoaded', () => {
  // (Optional) If you're fetching hamburger.html, do that here
  // e.g. fetch('hamburger.html').then(...) 

  // Populate table with data
  populateTable(requestsData);

  // Filter logic
  document.getElementById('statusFilter').addEventListener('change', function() {
    const selectedStatus = this.value;
    if (selectedStatus === 'all') {
      populateTable(requestsData);
    } else {
      const filtered = requestsData.filter(req => req.donationStatus === selectedStatus);
      populateTable(filtered);
    }
  });

  // Initialize modals
  initModals();
});

function populateTable(dataArray) {
  const tbody = document.querySelector('#requestTable tbody');
  tbody.innerHTML = ''; // Clear existing rows

  dataArray.forEach((req, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${req.recipientName}</td>
      <td>${req.bloodGroup}</td>
      <td>${req.dateTime}</td>
      <td>${req.hospitalName}</td>
      <td>${req.fullAddress}</td>
      <td>${req.reason}</td>
      <td>${req.donationStatus}</td>
      <td><button class="btn-view" data-index="${index}">View</button></td>
      <td><button class="btn-done" data-index="${index}">Done</button></td>
      <td><button class="btn-cancel" data-index="${index}">Cancel</button></td>
    `;

    tbody.appendChild(row);
  });

  // Attach event listeners for View/Done/Cancel
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', handleView);
  });
  document.querySelectorAll('.btn-done').forEach(btn => {
    btn.addEventListener('click', handleDone);
  });
  document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', handleCancel);
  });
}

function handleView(e) {
  const index = e.target.dataset.index;
  const req = requestsData[index];
  // Fill modal with request details
  document.getElementById('modalRecipientName').textContent = req.recipientName;
  document.getElementById('modalRecipientBloodGroup').textContent = req.bloodGroup;
  document.getElementById('modalDateTime').textContent = req.dateTime;
  document.getElementById('modalAddress').textContent = req.fullAddress;
  document.getElementById('modalHospitalName').textContent = req.hospitalName;
  document.getElementById('modalReason').textContent = req.reason;
  document.getElementById('modalStatus').textContent = req.donationStatus;

  // Show the Request Modal
  document.getElementById('requestModalOverlay').style.display = 'flex';
}

function handleDone(e) {
  alert('Done clicked! (simulate changing status to done in real app)');
  // In a real app, you’d update the request’s donationStatus in your DB or local data.
}

function handleCancel(e) {
  alert('Cancel clicked! (simulate changing status to canceled in real app)');
  // In a real app, you’d update the request’s donationStatus in your DB or local data.
}

function initModals() {
  // Request Modal
  const requestModalOverlay = document.getElementById('requestModalOverlay');
  const closeRequestModal = document.getElementById('closeRequestModal');
  closeRequestModal.addEventListener('click', () => {
    requestModalOverlay.style.display = 'none';
  });

  // "Donate" button in Request Modal
  const donateBtn = document.getElementById('donateBtn');
  donateBtn.addEventListener('click', () => {
    // Hide request modal
    requestModalOverlay.style.display = 'none';
    // Show donate modal
    document.getElementById('donateModalOverlay').style.display = 'flex';
  });

  // Donate (Confirm) Modal
  const donateModalOverlay = document.getElementById('donateModalOverlay');
  const closeDonateModal = document.getElementById('closeDonateModal');
  closeDonateModal.addEventListener('click', () => {
    donateModalOverlay.style.display = 'none';
  });

  const confirmDonationBtn = document.getElementById('confirmDonationBtn');
  confirmDonationBtn.addEventListener('click', () => {
    // In a real app, you'd store donorNameInput and donorEmailInput somewhere
    document.getElementById('donateModalOverlay').style.display = 'none';
    // Show confirmed modal
    document.getElementById('confirmedModalOverlay').style.display = 'flex';
  });

  // Confirmed Modal
  const confirmedModalOverlay = document.getElementById('confirmedModalOverlay');
  const closeConfirmedModal = document.getElementById('closeConfirmedModal');
  closeConfirmedModal.addEventListener('click', () => {
    confirmedModalOverlay.style.display = 'none';
  });
}